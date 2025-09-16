/**
 * PDF Service
 * Contains functionality for generating PDF documents
 */

import htmlPdf from 'html-pdf-node';
import path from 'path';

export class PDFService {
  /**
   * Generate PDF from HTML content
   * @param {string} htmlContent - HTML content to convert to PDF
   * @param {Object} options - PDF generation options
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generatePDF(htmlContent, options = {}) {
    const defaultOptions = {
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      displayHeaderFooter: false,
      printBackground: true,
      ...options,
    };

    const file = { content: htmlContent };

    try {
      const pdfBuffer = await htmlPdf.generatePdf(file, defaultOptions);
      return pdfBuffer;
    } catch (error) {
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
  }

  /**
   * Generate PDF for prayer export
   * @param {Array} prayers - Array of prayers to export
   * @param {Object} userInfo - User information
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generatePrayerPDF(prayers, userInfo) {
    const htmlContent = this.generatePrayerHTML(prayers, userInfo);
    return await this.generatePDF(htmlContent);
  }

  /**
   * Generate PDF for diary entries export
   * @param {Array} entries - Array of diary entries to export
   * @param {Object} userInfo - User information
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generateDiaryPDF(entries, userInfo) {
    const htmlContent = this.generateDiaryHTML(entries, userInfo);
    return await this.generatePDF(htmlContent);
  }

  /**
   * Generate HTML content for prayers
   * @param {Array} prayers - Array of prayers
   * @param {Object} userInfo - User information
   * @returns {string} HTML content
   */
  static generatePrayerHTML(prayers, userInfo) {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatCategory = (categoria) => {
      const categories = {
        gratidao: 'Gratidão',
        pedido: 'Pedido',
        intercession: 'Intercessão',
        contemplation: 'Contemplação',
        confissao: 'Confissão',
        louvor: 'Louvor',
        adoracao: 'Adoração',
        petição: 'Petição',
      };
      return categories[categoria] || categoria;
    };

    const prayersHTML = prayers.map(prayer => `
      <div class="prayer-item">
        <div class="prayer-header">
          <h3 class="prayer-title">${prayer.titulo}</h3>
          <span class="prayer-category">${formatCategory(prayer.categoria)}</span>
        </div>
        <div class="prayer-meta">
          <span class="prayer-date">${formatDate(prayer.createdAt)}</span>
          ${prayer.tempoGasto ? `<span class="prayer-time">${prayer.tempoGasto} min</span>` : ''}
        </div>
        <div class="prayer-content">${prayer.conteudo}</div>
        ${prayer.emocoes && prayer.emocoes.length > 0 ? `
          <div class="prayer-emotions">
            <strong>Emoções:</strong> ${prayer.emocoes.join(', ')}
          </div>
        ` : ''}
        ${prayer.reflexoes ? `
          <div class="prayer-reflections">
            <strong>Reflexões:</strong> ${prayer.reflexoes}
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Minhas Orações - ${userInfo.name}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #fafafa;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #8b5a3c;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #8b5a3c;
          font-size: 28px;
          margin: 0;
        }
        .header h2 {
          color: #666;
          font-size: 18px;
          margin: 10px 0 0 0;
          font-weight: normal;
        }
        .export-info {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
          font-style: italic;
        }
        .prayer-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        .prayer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .prayer-title {
          color: #8b5a3c;
          font-size: 20px;
          margin: 0;
        }
        .prayer-category {
          background: #8b5a3c;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }
        .prayer-meta {
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
        }
        .prayer-time {
          margin-left: 15px;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 10px;
        }
        .prayer-content {
          margin-bottom: 15px;
          line-height: 1.8;
          text-align: justify;
        }
        .prayer-emotions,
        .prayer-reflections {
          margin-top: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-left: 4px solid #8b5a3c;
          border-radius: 0 4px 4px 0;
        }
        .prayer-emotions strong,
        .prayer-reflections strong {
          color: #8b5a3c;
        }
        .summary {
          background: #8b5a3c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .summary h3 {
          margin: 0 0 10px 0;
        }
        @media print {
          body { background: white; }
          .prayer-item { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Minhas Orações</h1>
        <h2>${userInfo.name}</h2>
      </div>
      
      <div class="export-info">
        Exportado em ${formatDate(new Date())}
      </div>

      <div class="summary">
        <h3>Resumo</h3>
        <p>Total de orações: ${prayers.length}</p>
        <p>Período: ${formatDate(prayers[prayers.length - 1]?.createdAt)} - ${formatDate(prayers[0]?.createdAt)}</p>
      </div>

      <div class="prayers-container">
        ${prayersHTML}
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate HTML content for diary entries
   * @param {Array} entries - Array of diary entries
   * @param {Object} userInfo - User information
   * @returns {string} HTML content
   */
  static generateDiaryHTML(entries, userInfo) {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatClima = (clima) => {
      const climas = {
        paz: 'Paz',
        alegria: 'Alegria',
        gratidao: 'Gratidão',
        esperanca: 'Esperança',
        ansiedade: 'Ansiedade',
        tristeza: 'Tristeza',
        confusao: 'Confusão',
        medo: 'Medo',
        raiva: 'Raiva',
        solidao: 'Solidão',
        contentamento: 'Contentamento',
        adoracao: 'Adoração',
        reflexao: 'Reflexão',
        contemplacao: 'Contemplação',
      };
      return climas[clima] || clima;
    };

    const entriesHTML = entries.map(entry => `
      <div class="entry-item">
        <div class="entry-header">
          ${entry.titulo ? `<h3 class="entry-title">${entry.titulo}</h3>` : ''}
          <div class="entry-meta">
            <span class="entry-date">${formatDate(entry.createdAt)}</span>
            ${entry.clima ? `<span class="entry-climate">${formatClima(entry.clima)}</span>` : ''}
          </div>
        </div>
        
        <div class="entry-content">${entry.conteudo}</div>
        
        ${entry.reflexoes ? `
          <div class="entry-section">
            <h4>Reflexões</h4>
            <p>${entry.reflexoes}</p>
          </div>
        ` : ''}
        
        ${entry.emocoes && entry.emocoes.length > 0 ? `
          <div class="entry-section">
            <h4>Emoções</h4>
            <p>${entry.emocoes.join(', ')}</p>
          </div>
        ` : ''}
        
        ${entry.gratidao && entry.gratidao.length > 0 ? `
          <div class="entry-section">
            <h4>Gratidão</h4>
            <ul class="gratitude-list">
              ${entry.gratidao.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${entry.oracoes && entry.oracoes.length > 0 ? `
          <div class="entry-section">
            <h4>Orações</h4>
            <ul class="prayer-list">
              ${entry.oracoes.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${entry.versiculos && entry.versiculos.length > 0 ? `
          <div class="entry-section">
            <h4>Versículos</h4>
            <ul class="verses-list">
              ${entry.versiculos.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meu Diário da Fé - ${userInfo.name}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #fafafa;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #6b4e3d;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #6b4e3d;
          font-size: 28px;
          margin: 0;
        }
        .header h2 {
          color: #666;
          font-size: 18px;
          margin: 10px 0 0 0;
          font-weight: normal;
        }
        .export-info {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
          font-style: italic;
        }
        .entry-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          page-break-inside: avoid;
        }
        .entry-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        .entry-title {
          color: #6b4e3d;
          font-size: 22px;
          margin: 0 0 10px 0;
        }
        .entry-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .entry-date {
          color: #666;
          font-size: 14px;
        }
        .entry-climate {
          background: #6b4e3d;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
        }
        .entry-content {
          margin-bottom: 20px;
          line-height: 1.8;
          text-align: justify;
          font-size: 16px;
        }
        .entry-section {
          margin-top: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #6b4e3d;
          border-radius: 0 4px 4px 0;
        }
        .entry-section h4 {
          color: #6b4e3d;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .entry-section p {
          margin: 0;
          line-height: 1.6;
        }
        .gratitude-list,
        .prayer-list,
        .verses-list {
          margin: 0;
          padding-left: 20px;
        }
        .gratitude-list li,
        .prayer-list li,
        .verses-list li {
          margin-bottom: 5px;
        }
        .verses-list li {
          font-style: italic;
          color: #555;
        }
        .summary {
          background: #6b4e3d;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .summary h3 {
          margin: 0 0 10px 0;
        }
        @media print {
          body { background: white; }
          .entry-item { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Meu Diário da Fé</h1>
        <h2>${userInfo.name}</h2>
      </div>
      
      <div class="export-info">
        Exportado em ${formatDate(new Date())}
      </div>

      <div class="summary">
        <h3>Resumo</h3>
        <p>Total de entradas: ${entries.length}</p>
        <p>Período: ${formatDate(entries[entries.length - 1]?.createdAt)} - ${formatDate(entries[0]?.createdAt)}</p>
      </div>

      <div class="entries-container">
        ${entriesHTML}
      </div>
    </body>
    </html>
    `;
  }
}