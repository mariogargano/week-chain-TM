// PDF Contract Generator for Legal Documents
// Generates standardized contracts for NOM-151 certification

interface ContractData {
  userId: string
  userName: string
  userEmail: string
  userRFC?: string
  propertyId: string
  propertyName: string
  propertyAddress: string
  weekNumber: number
  year: number
  price: number
  currency: string
  series: string
  folio?: string
}

export class ContractGenerator {
  /**
   * Generate a Cesión de Uso contract PDF
   * Returns base64 encoded PDF
   */
  static async generateCesionDeUso(data: ContractData): Promise<string> {
    // In production, use a proper PDF library like pdfkit or puppeteer
    // For now, we'll create a simple HTML-based contract

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin: 20px 0; }
    .signature { margin-top: 60px; border-top: 1px solid #000; width: 200px; }
    .footer { margin-top: 40px; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE CESIÓN DE USO VACACIONAL</h1>
    <p><strong>WEEK-CHAIN S.A.P.I. de C.V.</strong></p>
    <p>Serie: ${data.series} | Folio: ${data.folio || "PENDIENTE"}</p>
  </div>

  <div class="section">
    <h2>I. PARTES</h2>
    <p><strong>CEDENTE:</strong> WEEK-CHAIN S.A.P.I. de C.V., con domicilio en [DIRECCIÓN], representada por [REPRESENTANTE LEGAL].</p>
    <p><strong>CESIONARIO:</strong> ${data.userName}, con correo electrónico ${data.userEmail}${data.userRFC ? `, RFC: ${data.userRFC}` : ""}.</p>
  </div>

  <div class="section">
    <h2>II. OBJETO DEL CONTRATO</h2>
    <p>El CEDENTE otorga al CESIONARIO el derecho de uso vacacional sobre la propiedad ubicada en:</p>
    <p><strong>${data.propertyName}</strong><br>${data.propertyAddress}</p>
    <p><strong>Semana:</strong> ${data.weekNumber} del año ${data.year}</p>
    <p><strong>Vigencia:</strong> 15 años a partir de la fecha de firma</p>
  </div>

  <div class="section">
    <h2>III. CONTRAPRESTACIÓN</h2>
    <p>El CESIONARIO pagará al CEDENTE la cantidad de <strong>${data.price} ${data.currency}</strong> por el derecho de uso vacacional.</p>
  </div>

  <div class="section">
    <h2>IV. DECLARACIONES</h2>
    <p>1. Este contrato NO constituye propiedad inmobiliaria ni instrumento financiero.</p>
    <p>2. El derecho de uso es intransferible salvo autorización expresa del CEDENTE.</p>
    <p>3. El CESIONARIO acepta los términos y condiciones disponibles en weekchain.com/terms</p>
    <p>4. Este contrato cumple con NOM-029-SE-2021 y NOM-151-SCFI-2016.</p>
  </div>

  <div class="section">
    <h2>V. DERECHO DE CANCELACIÓN</h2>
    <p>El CESIONARIO tiene derecho a cancelar este contrato dentro de los 5 días hábiles siguientes a su firma, conforme a la NOM-029-SE-2021.</p>
  </div>

  <div class="footer">
    <p>Fecha de generación: ${new Date().toLocaleDateString("es-MX")}</p>
    <p>Este documento será certificado conforme a NOM-151-SCFI-2016</p>
    <p>ID de Contrato: ${data.propertyId}-${data.weekNumber}</p>
  </div>

  <div class="signature">
    <p>_______________________</p>
    <p>Firma del CESIONARIO</p>
  </div>
</body>
</html>
    `

    // Convert HTML to PDF (in production, use puppeteer or similar)
    // For now, return base64 encoded HTML as placeholder
    return Buffer.from(html).toString("base64")
  }

  /**
   * Generate contract filename
   */
  static generateFilename(data: ContractData): string {
    return `contrato-${data.series}-${data.userId}-${data.weekNumber}.pdf`
  }
}
