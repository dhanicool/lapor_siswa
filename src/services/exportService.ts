import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportItem, SchoolSettings, FilterState } from '../types';

export const exportToExcel = (
  reports: ReportItem[],
  schoolSettings: SchoolSettings,
  filterInfo?: FilterState
) => {
  const wb = XLSX.utils.book_new();

  // 1. Prepare Main Data Table
  const tableData = reports.map((r, index) => ({
    'No': index + 1,
    'ID Laporan': r.reportId,
    'Nama Pelapor': r.isAnonymous ? `${r.studentName} (Anonim)` : r.studentName,
    'Kelas': r.classGrade || '-',
    'Kontak': r.contactInfo || '-',
    'Tanggal Kejadian': r.incidentDate,
    'Waktu Kejadian': r.incidentTime,
    'Kelompok Waktu': r.timeSlotGroup || '-',
    'Lokasi Kejadian': r.location,
    'Status Pelapor': r.reporterStatus,
    'Kategori Bullying': r.category,
    'Tingkat Urgensi': r.urgency,
    'Status Penanganan': r.status.toUpperCase(),
    'Kronologi Singkat': r.chronology,
    'Catatan Konseling Guru BK': r.counselingNotes || '-',
    'Guru BK Penanggung Jawab': r.assignedCounselor || '-',
    'Waktu Dibuat': new Date(r.createdAt).toLocaleString('id-ID'),
    'Terakhir Diperbarui': new Date(r.updatedAt).toLocaleString('id-ID'),
  }));

  const ws = XLSX.utils.json_to_sheet(tableData);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 18 }, // ID
    { wch: 22 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 16 }, // Kontak
    { wch: 15 }, // Tanggal
    { wch: 14 }, // Waktu
    { wch: 18 }, // Kelompok Waktu
    { wch: 18 }, // Lokasi
    { wch: 14 }, // Status Pelapor
    { wch: 30 }, // Kategori
    { wch: 14 }, // Urgensi
    { wch: 16 }, // Status
    { wch: 45 }, // Kronologi
    { wch: 35 }, // Catatan
    { wch: 25 }, // Guru BK
    { wch: 20 }, // Created
    { wch: 20 }  // Updated
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Laporan');

  // 2. Summary Sheet
  const total = reports.length;
  const korban = reports.filter(r => r.reporterStatus === 'Korban').length;
  const saksi = reports.filter(r => r.reporterStatus === 'Saksi').length;
  const baru = reports.filter(r => r.status === 'baru').length;
  const ditinjau = reports.filter(r => r.status === 'ditinjau').length;
  const ditindak = reports.filter(r => r.status === 'ditindaklanjuti').length;
  const selesai = reports.filter(r => r.status === 'selesai').length;

  const summaryData = [
    { 'Keterangan': 'Nama Sekolah', 'Nilai': schoolSettings.schoolName },
    { 'Keterangan': 'NPSN', 'Nilai': schoolSettings.npsn },
    { 'Keterangan': 'Alamat', 'Nilai': schoolSettings.address },
    { 'Keterangan': 'Kepala Sekolah', 'Nilai': schoolSettings.principalName },
    { 'Keterangan': 'Koordinator BK', 'Nilai': schoolSettings.bkHeadTeacher },
    { 'Keterangan': 'Tanggal Export', 'Nilai': new Date().toLocaleDateString('id-ID', { dateStyle: 'full' }) },
    { 'Keterangan': '---', 'Nilai': '---' },
    { 'Keterangan': 'Total Laporan Diexport', 'Nilai': total },
    { 'Keterangan': 'Laporan Korban', 'Nilai': `${korban} (${total ? Math.round((korban/total)*100) : 0}%)` },
    { 'Keterangan': 'Laporan Saksi', 'Nilai': `${saksi} (${total ? Math.round((saksi/total)*100) : 0}%)` },
    { 'Keterangan': 'Status: Baru Masuk', 'Nilai': baru },
    { 'Keterangan': 'Status: Sedang Ditinjau', 'Nilai': ditinjau },
    { 'Keterangan': 'Status: Sedang Ditindaklanjuti', 'Nilai': ditindak },
    { 'Keterangan': 'Status: Kasus Selesai', 'Nilai': selesai }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // File name format
  const dateStr = new Date().toISOString().split('T')[0];
  const safeSchoolName = schoolSettings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Laporan_Bullying_${safeSchoolName}_${dateStr}.xlsx`);
};

export const exportToPdf = (
  reports: ReportItem[],
  schoolSettings: SchoolSettings,
  filterInfo?: FilterState
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Formal Kop Surat Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 40, 80);
  doc.text(schoolSettings.schoolName.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`NPSN: ${schoolSettings.npsn} | ${schoolSettings.address}, ${schoolSettings.city}`, pageWidth / 2, 19, { align: 'center' });
  doc.text(`Layanan Bimbingan Konseling (BK) | Hotline: ${schoolSettings.emergencyHotline} | Email: ${schoolSettings.bkEmail}`, pageWidth / 2, 24, { align: 'center' });

  // Divider line
  doc.setDrawColor(20, 40, 80);
  doc.setLineWidth(0.8);
  doc.line(14, 27, pageWidth - 14, 27);
  doc.setLineWidth(0.2);
  doc.line(14, 28, pageWidth - 14, 28);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('REKAPITULASI LAPORAN PENGADUAN PERUNDUNGAN (BULLYING)', pageWidth / 2, 35, { align: 'center' });

  // Summary Metrics Banner
  const total = reports.length;
  const korban = reports.filter(r => r.reporterStatus === 'Korban').length;
  const saksi = reports.filter(r => r.reporterStatus === 'Saksi').length;
  const selesai = reports.filter(r => r.status === 'selesai').length;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(243, 246, 252);
  doc.rect(14, 38, pageWidth - 28, 11, 'F');
  doc.setDrawColor(200, 215, 235);
  doc.rect(14, 38, pageWidth - 28, 11, 'S');

  doc.setTextColor(40, 50, 70);
  const infoText = `Total Laporan: ${total} Kasus | Korban: ${korban} | Saksi: ${saksi} | Selesai Ditangani: ${selesai} | Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`;
  doc.text(infoText, pageWidth / 2, 45, { align: 'center' });

  // Table Columns & Rows
  const tableRows = reports.map((r, index) => [
    index + 1,
    r.reportId,
    r.isAnonymous ? `${r.studentName} (Anonim)` : r.studentName,
    r.classGrade || '-',
    `${r.incidentDate}\n${r.incidentTime}`,
    r.location,
    r.reporterStatus,
    r.category.split('(')[0].trim(),
    r.status.toUpperCase(),
    r.chronology.length > 80 ? r.chronology.substring(0, 80) + '...' : r.chronology,
    r.counselingNotes ? (r.counselingNotes.length > 50 ? r.counselingNotes.substring(0, 50) + '...' : r.counselingNotes) : '-'
  ]);

  autoTable(doc, {
    startY: 52,
    head: [[
      'No',
      'ID Laporan',
      'Nama Siswa',
      'Kelas',
      'Waktu',
      'Lokasi',
      'Status',
      'Kategori',
      'Penanganan',
      'Kronologi Kejadian',
      'Catatan Guru BK'
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [30, 58, 138], // Navy
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 20 },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 28 },
      8: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 55 },
      10: { cellWidth: 42 }
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Halaman ${doc.getNumberOfPages()} | Sistem Pengaduan Bullying ${schoolSettings.schoolName}`;
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text(str, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  });

  // Signature Block at the end of the report
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : pageHeight - 40;
  
  if (finalY + 35 < pageHeight) {
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    // Left signature: Guru BK
    doc.text('Mengetahui,', 30, finalY);
    doc.text('Koordinator Bimbingan Konseling (BK)', 30, finalY + 5);
    doc.text('(_______________________________)', 30, finalY + 24);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolSettings.bkHeadTeacher, 30, finalY + 29);

    // Right signature: Kepala Sekolah
    doc.setFont('helvetica', 'normal');
    doc.text(`${schoolSettings.city.split(',')[0].trim()}, ${todayFormatted}`, pageWidth - 90, finalY);
    doc.text('Kepala Sekolah,', pageWidth - 90, finalY + 5);
    doc.text('(_______________________________)', pageWidth - 90, finalY + 24);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolSettings.principalName, pageWidth - 90, finalY + 29);
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const safeSchoolName = schoolSettings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_Bullying_${safeSchoolName}_${dateStr}.pdf`);
};
