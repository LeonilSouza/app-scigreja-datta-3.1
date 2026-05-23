
import * as pdfjsLib from 'pdfjs-dist';
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

  igrejaId = igrejaIdSignal(); // ID da Sede Central de Cuiabá
  
  urlFundoDocumento: any = null;
  arquivoSelecionado: File | null = null;
  isPDF: boolean = false;
  
 // Coordenadas calculadas em tempo real pelo arrastar do mouse
  coordenadaX: number = 50; 
  coordenadaY: number = 50;
  larguraAssinatura: number = 250;

  // Armazena a imagem da própria assinatura do pastor para mostrar no quadradinho arrastável
  urlAssinaturaPastor: string = '';
  
  // Documento final retornado pelo Java pronto
  documentoResultadoUrl: SafeUrl | null = null;
  carregando: boolean = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) {}

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

    const urlLocal = URL.createObjectURL(this.arquivoSelecionado!);
    // Usa bypassSecurityTrustResourceUrl para o <object> conseguir ler o PDF local
    this.urlFundoDocumento = this.sanitizer.bypassSecurityTrustResourceUrl(urlLocal);
  }

  // 🔥 O PULO DO GATO ESTILO GOV.BR: Captura o exato momento em que o usuário solta o mouse
  onArrastarFinalizado(event: CdkDragEnd) {
    // Pegamos a posição do elemento em relação ao container de visualização
    const elementoMovel = event.source.element.nativeElement;
    const containerPai = elementoMovel.parentElement;

    if (containerPai) {
      const posicaoPai = containerPai.getBoundingClientRect();
      const posicaoElemento = elementoMovel.getBoundingClientRect();

      // Calcula os pixels exatos de onde o carimbo foi solto na folha
      this.coordenadaX = Math.round(posicaoElemento.left - posicaoPai.left);
      this.coordenadaY = Math.round(posicaoElemento.top - posicaoPai.top);
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
      .set('pagina', '1')
      .set('coordenadaX', xFinal.toString())
      .set('coordenadaY', yFinal.toString())
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