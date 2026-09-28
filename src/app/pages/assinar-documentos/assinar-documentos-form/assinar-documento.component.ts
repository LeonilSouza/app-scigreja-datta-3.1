import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { API_CONFIG } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { igrejaIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import * as pdfjsLib from 'pdfjs-dist';
import { AssinaturaDigital } from 'src/app/theme/shared/models/assinatura-digital.dto';
import { AssinaturaService } from 'src/app/theme/shared/services/assinatura.service';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-assinar-documento',
  templateUrl: './assinar-documento.component.html',
  styleUrls: ['./assinar-documento.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
    FileUploadModule,
    ButtonModule,
    DragDropModule,
  ],
  providers: [AssinaturaService],
})
export class AssinarDocumentoComponent implements OnInit {

  igrejaId = igrejaIdSignal();

  // Documento
  urlFundoDocumento: any = null;
  arquivoSelecionado: File | null = null;
  isPDF: boolean = false;

  // Posicionamento
  coordenadaX: number = 0.05;
  coordenadaY: number = 0.80;
  larguraAssinatura: number = 285;

  // Assinaturas
  assinaturas: AssinaturaDigital[] = [];
  assinaturaSelecionada: AssinaturaDigital | null = null;

  // Paginação de assinaturas
  paginaAtualAssinaturas: number = 1;
  itensPorPaginaAssinaturas: number = 4;
  totalPaginasAssinaturas: number = 0;
  assinaturasPaginadas: AssinaturaDigital[] = [];

  // Resultado
  documentoResultadoUrl: SafeUrl | null = null;
  carregando: boolean = false;

  // PDF
  totalPaginas: number = 1;
  paginaSelecionada: number = 1;
  private pdfDocumento: any = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private assinaturaService: AssinaturaService
  ) { }

  ngOnInit(): void {
    this.carregarAssinaturas();
  }

  carregarAssinaturas() {
    this.assinaturaService.listarAssinaturas(this.igrejaId).subscribe({
      next: (lista) => {
        this.assinaturas = lista;
        this.totalPaginasAssinaturas = Math.ceil(lista.length / 4); // ✅ fixo
        this.atualizarPaginaAssinaturas();
        if (lista.length > 0 && !this.assinaturaSelecionada) {
          this.assinaturaSelecionada = lista[0];
        }
      }
    });
  }

  atualizarPaginaAssinaturas() {
    const inicio = (this.paginaAtualAssinaturas - 1) * 4; // ✅ fixo
    this.assinaturasPaginadas = this.assinaturas.slice(inicio, inicio + 4); // ✅ fixo
  }

  trocarPaginaAssinatura(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginasAssinaturas) return;
    this.paginaAtualAssinaturas = pagina;
    this.atualizarPaginaAssinaturas();
  }

  selecionarAssinatura(assinatura: AssinaturaDigital) {
    this.assinaturaSelecionada = assinatura;
  }

  onSelecionarArquivo(event: any) {
    if (!event?.files?.length) {
      this.arquivoSelecionado = null;
      this.urlFundoDocumento = null;
      return;
    }

    this.arquivoSelecionado = event.files[0];
    this.documentoResultadoUrl = null;
    this.isPDF = this.arquivoSelecionado!.type === 'application/pdf';
    this.totalPaginas = 1;
    this.paginaSelecionada = 1;

    const urlLocal = URL.createObjectURL(this.arquivoSelecionado!);
    this.urlFundoDocumento = this.sanitizer.bypassSecurityTrustResourceUrl(urlLocal);

    if (this.isPDF) {
      this.carregarPdf(this.arquivoSelecionado!);
    }
  }

  async carregarPdf(file: File) {
    const buffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(buffer);
    this.pdfDocumento = await pdfjsLib.getDocument(typedArray).promise;
    this.totalPaginas = this.pdfDocumento.numPages;
    setTimeout(() => this.renderizarPagina(this.paginaSelecionada), 0);
  }

  async renderizarPagina(numeroPagina: number) {
    if (!this.pdfDocumento) return;
    const pagina = await this.pdfDocumento.getPage(numeroPagina);
    const canvas = document.getElementById('canvas-pdf') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const viewport = pagina.getViewport({ scale: 1 });
    const escala = Math.min(500 / viewport.width, 618 / viewport.height);
    const viewportEscalado = pagina.getViewport({ scale: escala });
    canvas.width = viewportEscalado.width;
    canvas.height = viewportEscalado.height;
    await pagina.render({ canvasContext: ctx, viewport: viewportEscalado }).promise;
  }

  trocarPagina(novaPagina: number) {
    if (novaPagina < 1 || novaPagina > this.totalPaginas) return;
    this.paginaSelecionada = novaPagina;
    this.renderizarPagina(novaPagina);
  }

  onArrastarFinalizado(event: CdkDragEnd) {
    const elementoMovel = event.source.element.nativeElement;
    const containerPai = document.getElementById('boundary-documento');
    if (!containerPai) return;

    const posicaoPai = containerPai.getBoundingClientRect();
    const posicaoElemento = elementoMovel.getBoundingClientRect();

    const pixelX = posicaoElemento.left - posicaoPai.left;
    const pixelY = posicaoElemento.top - posicaoPai.top - 32;

    this.coordenadaX = pixelX / posicaoPai.width;
    this.coordenadaY = pixelY / (posicaoPai.height - 32);
  }

  confirmarAssinaturaDigital() {
    if (!this.arquivoSelecionado) {
      this.toastr.warning('Selecione um documento (PDF ou Imagem) primeiro.');
      return;
    }

    if (!this.assinaturaSelecionada) {
      this.toastr.warning('Selecione uma assinatura antes de continuar.');
      return;
    }

    this.carregando = true;

    const params = new HttpParams()
      .set('assinaturaId', this.assinaturaSelecionada.id.toString())
      .set('pagina', this.paginaSelecionada.toString())
      .set('coordenadaX', this.coordenadaX.toString())
      .set('coordenadaY', this.coordenadaY.toString())
      .set('larguraAssinatura', this.larguraAssinatura.toString());

    const formData = new FormData();
    formData.append('file', this.arquivoSelecionado!);

    this.http.post(
      `${API_CONFIG.baseUrl}/igrejas/assinar-documentos`,
      formData,
      { params, responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const urlObjeto = URL.createObjectURL(blob);
        this.documentoResultadoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlObjeto);
        this.carregando = false;
        this.toastr.success('Documento chancelado com sucesso!');
      },
      error: (err) => {
        this.carregando = false;
        this.toastr.error('Falha ao processar assinatura.');
        console.error(err);
      }
    });
  }

  baixarDocumentoPronto() {
    if (!this.documentoResultadoUrl) return;
    const link = document.createElement('a');
    link.href = (this.documentoResultadoUrl as any).changingThisBreaksApplicationSecurity;
    link.download = this.isPDF ? 'documento_assinado.pdf' : 'convite_assinado.png';
    link.click();
  }
}
