import { jsPDF } from 'jspdf';

/**
 * Generates a professional PDF portfolio for the artist
 * @param {Object} data - Contains profile, artworks, competitions, and translator
 */
export const generatePortfolioPDF = (data) => {
  const { profile, artworks, competitions, badgeCount, t } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setFillColor(124, 58, 237); // Primary color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.display_name?.toUpperCase() || 'ARTSTAR ARTIST', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ART PORTFOLIO', margin, 32);

  let yPos = 55;

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('common.journey_title'), margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Level: ${profile?.level || 1}`, margin, yPos);
  doc.text(`${t('dashboard.artworks_count')}: ${artworks.length}`, margin + 40, yPos);
  doc.text(`${t('dashboard.badges_count')}: ${badgeCount}`, margin + 80, yPos);

  yPos += 15;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t('common.featured_title'), margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const sortedArt = [...artworks].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  
  sortedArt.slice(0, 15).forEach((art, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const dateStr = new Date(art.date || art.created_at).toLocaleDateString();
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${art.title}`, margin, yPos);
    
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`(${t(`gallery.categories.${art.category}`)}) - ${dateStr}`, margin + 80, yPos);
    
    doc.setTextColor(50, 50, 50);
    yPos += 6;
    if (art.description) {
      const splitDesc = doc.splitTextToSize(art.description, pageWidth - 2 * margin - 10);
      doc.setFont('helvetica', 'normal');
      doc.text(splitDesc, margin + 5, yPos);
      yPos += (splitDesc.length * 5);
    }
    yPos += 4;
  });

  if (competitions.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('common.achievements_title'), margin, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    
    competitions.forEach((comp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const isWinner = comp.result === 'winner' || comp.result === 'grand_winner';
      if (isWinner) doc.setTextColor(184, 134, 11); // Gold-ish for winners
      
      const resultEmoji = isWinner ? ` [${t(`competitions.results.${comp.result}`).toUpperCase()}]` : '';
      doc.setFont('helvetica', 'bold');
      doc.text(`- ${comp.name}${resultEmoji}`, margin, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(new Date(comp.date).toLocaleDateString(), pageWidth - margin - 30, yPos);
      
      doc.setTextColor(50, 50, 50);
      yPos += 7;
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(t('common.produced_by', { page: i, total: pageCount }), pageWidth / 2, 285, { align: 'center' });
  }

  // Save the PDF
  doc.save(`${profile?.display_name || 'Artist'}_Art_Portfolio.pdf`);
};
