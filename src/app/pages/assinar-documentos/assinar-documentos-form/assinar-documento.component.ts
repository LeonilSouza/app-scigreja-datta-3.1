
import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { API_CONFIG } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from "primeng/button";
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { igrejaIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import * as pdfjsLib from 'pdfjs-dist';

// Colar fora da classe, logo após os imports
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
    DragDropModule
    // JsonPipe,
  ],
  providers: [
  ],
})

export class AssinarDocumentoComponent {
  
  
  igrejaIdSignal = igrejaIdSignal;

  igrejaId = igrejaIdSignal(); // ID do Setor Morada da Serra

  urlFundoDocumento: any = null;
  arquivoSelecionado: File | null = null;
  isPDF: boolean = false;

  // Coordenadas calculadas em tempo real pelo arrastar do mouse
  posicaoInicial: { x: number; y: number } = { x: 50, y: 400 };
  coordenadaX: number = 0.05;  // 5% da largura
  coordenadaY: number = 0.80;  // 80% da altura (rodapé)
  larguraAssinatura: number = 110;

  // Armazena a imagem da própria assinatura do pastor para mostrar no quadradinho arrastável
  urlAssinaturaPastor: string = '';

  // Documento final retornado pelo Java pronto
  documentoResultadoUrl: SafeUrl | null = null;
  carregando: boolean = false;

  totalPaginas: number = 1;
  paginaSelecionada: number = 1;
  private pdfDocumento: any = null;


  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.carregarAssinaturaDoPastorSede();
  }

  // Busca a assinatura PNG do pastor para usarmos como o "carimbo flutuante" na tela
  carregarAssinaturaDoPastorSede() {
    this.urlAssinaturaPastor = `${API_CONFIG.baseUrl}/igrejas/${this.igrejaId}/assinatura-imagem-raw`;
    // Nota: Crie uma rota GET simples no Java que retorne a assinatura pura se ainda não tiver, 
    // ou use uma imagem mock/padrão para o preview caso prefira.
  }

 onSelecionarArquivo(event: any) {
  if (event && event.files && event.files.length > 0) {
    this.arquivoSelecionado = event.files[0];
  } else {
    this.arquivoSelecionado = null;
    this.urlFundoDocumento = null;
    return;
  }

  this.documentoResultadoUrl = null;
  this.isPDF = this.arquivoSelecionado!.type === 'application/pdf';
  this.posicaoInicial = { x: 50, y: 400 };
  this.totalPaginas = 1;
  this.paginaSelecionada = 1;

  const urlLocal = URL.createObjectURL(this.arquivoSelecionado!);
  this.urlFundoDocumento = this.sanitizer.bypassSecurityTrustResourceUrl(urlLocal);

  // Se for PDF, consulta total de páginas E renderiza com PDF.js
  if (this.isPDF) {
    this.consultarTotalPaginas();
    this.carregarPdf(this.arquivoSelecionado!); // ← adiciona aqui
  }
}



async carregarPdf(file: File) {
  const buffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(buffer);

  this.pdfDocumento = await pdfjsLib.getDocument(typedArray).promise; // ← sem chaves, direto
  this.totalPaginas = this.pdfDocumento.numPages;
  this.renderizarPagina(this.paginaSelecionada);
}


async renderizarPagina(numeroPagina: number) {
  if (!this.pdfDocumento) return;

  const pagina = await this.pdfDocumento.getPage(numeroPagina);
  const canvas = document.getElementById('canvas-pdf') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Escala para caber nos 500x618px da área útil
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


consultarTotalPaginas() {
  const formData = new FormData();
  formData.append('file', this.arquivoSelecionado!);

  this.http.post<{ totalPaginas: number }>(`${API_CONFIG.baseUrl}/igrejas/total-paginas`, formData)
    .subscribe({
      next: (res) => {
        this.totalPaginas = res.totalPaginas;
      },
      error: () => {
        this.totalPaginas = 1; // fallback seguro
      }
    });
}


// 🔥 O PULO DO GATO ESTILO GOV.BR: Captura o exato momento em que o usuário solta o mouse
onArrastarFinalizado(event: CdkDragEnd) {
  const elementoMovel = event.source.element.nativeElement;
  const containerPai = document.getElementById('boundary-documento');

  if (containerPai) {
    const posicaoPai = containerPai.getBoundingClientRect();
    const posicaoElemento = elementoMovel.getBoundingClientRect();

    const pixelX = posicaoElemento.left - posicaoPai.left;
    const pixelY = posicaoElemento.top - posicaoPai.top - 32; // desconta header

    this.coordenadaX = pixelX / posicaoPai.width;
    this.coordenadaY = pixelY / (posicaoPai.height - 32);
  }
}





confirmarAssinaturaDigital() {
  // Se o arquivo for nulo, a função barra aqui e impede o compilador de chiar nas linhas de baixo!
  if (!this.arquivoSelecionado) {
    this.toastr.warning('Selecione um documento (PDF ou Imagem) primeiro.');
    return;
  }

  this.carregando = true;

  let xFinal = this.coordenadaX;
  let yFinal = this.coordenadaY;

  if (!this.isPDF && this.urlFundoDocumento) {
    const imgVirtual = new Image();
    // Usamos o operador '!' ou cast para dizer ao TS que o arquivo está garantido pelo 'if' do topo
    imgVirtual.src = (this.urlFundoDocumento as any).changingThisBreaksApplicationSecurity || URL.createObjectURL(this.arquivoSelecionado!);

    const larguraReal = imgVirtual.width;
    const alturaReal = imgVirtual.height;

    const larguraTela = 500;
    const alturaTela = 650 - 32;

    const fatorX = larguraReal / larguraTela;
    const fatorY = alturaReal / alturaTela;

    xFinal = Math.round(this.coordenadaX * fatorX);
    yFinal = Math.round((this.coordenadaY - 32) * fatorY);
  }

  const params = new HttpParams()
    .set('pagina', this.paginaSelecionada.toString())
    .set('coordenadaX', this.coordenadaX.toString())  // agora é 0.0 a 1.0
    .set('coordenadaY', this.coordenadaY.toString())  // agora é 0.0 a 1.0
    .set('larguraAssinatura', this.larguraAssinatura.toString());


  const formData = new FormData();
  // O caractere '!' avisa o TypeScript que checamos e o objeto NÃO é nulo nessa linha
  formData.append('file', this.arquivoSelecionado!);

  this.http.post(`${API_CONFIG.baseUrl}/igrejas/${this.igrejaId}/assinar-documentos`, formData, {
    params,
    responseType: 'blob'
  }).subscribe({
    next: (blob: Blob) => {
      const urlObjeto = URL.createObjectURL(blob);

      // 🔥 A CORREÇÃO CIRÚRGICA: Mudamos de bypassSecurityTrustUrl para bypassSecurityTrustResourceUrl
      // Isso avisa ao compilador do Angular que o PDF de resposta do Java é 100% seguro para rodar no <object>
      this.documentoResultadoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlObjeto);

      this.carregando = false;
      this.toastr.success('Documento chancelado com sucesso estilo gov.br!');
    },
    error: (err) => {
      this.carregando = false;
      this.toastr.error('Falha ao processar assinatura por coordenadas.');
      console.error(err);
    }
  });
}

baixarDocumentoPronto() {
  if (!this.documentoResultadoUrl) return;
  const link = document.createElement('a');
  link.href = (this.documentoResultadoUrl as any).changingThisBreaksApplicationSecurity;
  link.download = this.isPDF ? `documento_assinado.pdf` : `convite_assinado.png`;
  link.click();
}
}