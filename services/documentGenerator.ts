import { PedagogicalPrompt } from '../types';
import { PageBreak, ImageRun } from 'docx';
import type { Paragraph } from 'docx';

// Helper to get image dimensions from a data URL
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = (err) => {
            reject(err);
        };
        img.src = dataUrl;
    });
};

// Helper to convert data URL to Blob
const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

/**
 * Renders a markdown table string into a base64 encoded image.
 * This prevents table formatting issues across different document types.
 * @param tableMarkdown The markdown string of the table.
 * @returns A promise that resolves to a data URL (png) of the rendered table.
 */
const renderTableToImage = async (tableMarkdown: string): Promise<string> => {
    const html2canvas = (await import('html2canvas')).default;

    const lines = tableMarkdown.trim().split('\n').filter(line => line.includes('|'));
    if (lines.length < 2) return ''; // Not a valid table

    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(rowLine => rowLine.split('|').map(c => c.trim()).filter(Boolean));

    const tableContainer = document.createElement('div');
    tableContainer.style.position = 'absolute';
    tableContainer.style.left = '-9999px';
    tableContainer.style.padding = '1px';
    tableContainer.style.backgroundColor = 'white';
    tableContainer.style.display = 'inline-block';

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '16px';
    table.style.border = '1px solid black';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid black';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        th.style.fontWeight = 'bold';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    rows.forEach(rowData => {
        const row = tbody.insertRow();
        rowData.forEach(cellText => {
            const cell = row.insertCell();
            cell.textContent = cellText;
            cell.style.border = '1px solid black';
            cell.style.padding = '8px';
            cell.style.textAlign = 'left';
        });
    });

    tableContainer.appendChild(table);
    document.body.appendChild(tableContainer);

    const canvas = await html2canvas(tableContainer, { scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');

    document.body.removeChild(tableContainer);
    return dataUrl;
};

/**
 * Finds markdown tables in text, converts them to images, and returns the modified text
 * with placeholders and a map of placeholders to image data.
 * @param activityText The original text of the activity.
 * @returns An object containing the processed text and a map of table images.
 */
const processTablesInActivity = async (activityText: string): Promise<{ processedText: string; tableImages: { [key: string]: string } }> => {
    const tableRegex = /\[TABLE_START\]([\s\S]*?)\[TABLE_END\]/g;
    let processedText = activityText;
    const tableImages: { [key: string]: string } = {};
    let tableIndex = 0;

    // Use a temporary variable to handle all replacements to avoid issues with loop-based replacement on a changing string
    let tempText = activityText;
    const replacements: {from: string, to: string}[] = [];

    const matches = Array.from(activityText.matchAll(tableRegex));

    for (const match of matches) {
        const tableMarkdown = match[1];
        const placeholder = `[--TABLE_IMAGE_${tableIndex}--]`;
        try {
            const imageUrl = await renderTableToImage(tableMarkdown);
            if(imageUrl) {
                tableImages[placeholder] = imageUrl;
                replacements.push({ from: match[0], to: placeholder });
                tableIndex++;
            } else {
                 replacements.push({ from: match[0], to: tableMarkdown }); // fallback
            }
        } catch (error) {
            console.error("Failed to render table to image:", error);
            replacements.push({ from: match[0], to: tableMarkdown });
        }
    }
    
    replacements.forEach(rep => {
        tempText = tempText.replace(rep.from, rep.to);
    });

    return { processedText: tempText, tableImages };
};


// Helper to render the prompt content to a styled HTML element for image capture
const renderPromptToHtmlElement = async (promptData: PedagogicalPrompt, imageUrl: string | null): Promise<HTMLElement> => {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.color = 'black';
    container.style.lineHeight = '1.6';
    
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const title = document.createElement('h1');
    title.innerText = promptData.conteudoTema;
    title.style.fontSize = '28px';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.marginBottom = '25px';
    title.style.color = '#333';
    container.appendChild(title);

    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '378px'; // 10cm
        img.style.height = '227px'; // 6cm
        img.style.objectFit = 'cover';
        img.style.margin = '20px auto';
        img.style.display = 'block';
        img.style.borderRadius = '8px';
        container.appendChild(img);
    }
    
    const { processedText, tableImages } = await processTablesInActivity(promptData.folhaDeAtividades);
    const activityLines = processedText.split('\n');

    activityLines.forEach(line => {
        if (line.startsWith('[--TABLE_IMAGE_') && line.endsWith('--]')) {
            const tableImg = document.createElement('img');
            tableImg.src = tableImages[line];
            tableImg.style.display = 'block';
            tableImg.style.maxWidth = '100%';
            tableImg.style.margin = '16px 0';
            container.appendChild(tableImg);
        } else {
            const p = document.createElement('p');
            p.style.marginBottom = '8px';
            const trimmedLine = line.trim();
            const isTitle = trimmedLine && trimmedLine === trimmedLine.toUpperCase() && !/^\d+\./.test(trimmedLine);

            if (isTitle) {
                const strong = document.createElement('strong');
                strong.innerText = line;
                p.appendChild(strong);
                p.style.fontSize = '18px';
                p.style.marginTop = '20px';
                p.style.color = '#111';
            } else {
                p.innerText = line || '\u00A0'; // Use non-breaking space for empty lines
                p.style.fontSize = '16px';
            }
            container.appendChild(p);
        }
    });

    return container;
}


export const generatePdf = async (promptData: PedagogicalPrompt, imageUrl: string | null): Promise<Blob | null> => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - 2 * margin;
    let y = 20;

    const addText = (text: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
        if (!text || text.trim() === '') {
            y += 5; // Add space for empty lines
            return;
        }
        const splitText = doc.splitTextToSize(text, usableWidth);
        const textHeight = doc.getTextDimensions(splitText).h;
        if (y + textHeight > 280) {
            doc.addPage();
            y = 20;
        }
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(60, 60, 60);
        doc.text(splitText, margin, y);
        y += textHeight + 4;
    };
    
    const addImage = (imageData: string) => {
        try {
            const imgProps = doc.getImageProperties(imageData);
            const aspectRatio = imgProps.width / imgProps.height;
            const imgWidth = usableWidth;
            const imgHeight = imgWidth / aspectRatio;
             if (y + imgHeight > 280) {
                doc.addPage();
                y = 20;
            }
            doc.addImage(imageData, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 5;
        } catch (e) {
             console.error("Could not add image to PDF:", e);
        }
    };


    // --- Plano de Aula ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(`Plano de Aula: ${promptData.conteudoTema}`, usableWidth);
    doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
    y += (doc.getTextDimensions(titleLines).h) + 10;
    
    addText(promptData.codigoAlfanumerico, 11, 'bold');
    addText(promptData.habilidade, 11, 'italic');
    y += 5;

    const planoLines = promptData.planoDeAula.split('\n');
    planoLines.forEach(line => {
        const trimmedLine = line.trim();
        const isTitle = trimmedLine && trimmedLine === trimmedLine.toUpperCase() && !/^\d+\./.test(trimmedLine);
        addText(line, isTitle ? 12 : 11, isTitle ? 'bold' : 'normal');
    });

    // --- Folha de Atividades (New Page) ---
    doc.addPage();
    y = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    const activityTitleLines = doc.splitTextToSize(`Atividade: ${promptData.conteudoTema}`, usableWidth);
    doc.text(activityTitleLines, pageWidth / 2, y, { align: 'center' });
    y += (doc.getTextDimensions(activityTitleLines).h) + 10;
    
    if (imageUrl) {
        try {
            const imgWidth = 100; // 10cm
            const imgHeight = 60; // 6cm
            if (y + imgHeight > 280) { doc.addPage(); y = 20; }
            doc.addImage(imageUrl, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 10;
        } catch (e) {
            console.error("Could not add image to PDF:", e);
        }
    }

    const { processedText, tableImages } = await processTablesInActivity(promptData.folhaDeAtividades);
    const activityLines = processedText.split('\n');
    
    for(const line of activityLines) {
        if (line.startsWith('[--TABLE_IMAGE_') && line.endsWith('--]')) {
            const tableImgData = tableImages[line];
            if (tableImgData) {
                addImage(tableImgData);
            }
        } else {
            const trimmedLine = line.trim();
            const isTitle = trimmedLine && trimmedLine === trimmedLine.toUpperCase() && !/^\d+\./.test(trimmedLine);
            addText(line, isTitle ? 12 : 11, isTitle ? 'bold' : 'normal');
        }
    }

    return doc.output('blob');
};

export const generateDocx = async (promptData: PedagogicalPrompt, imageUrl: string | null): Promise<Blob | null> => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

    const createParagraph = (line: string): Paragraph => {
        const trimmedLine = line.trim();
        const isTitle = trimmedLine && trimmedLine === trimmedLine.toUpperCase() && !/^\d+\./.test(trimmedLine);
        const isHeader = line.includes("NOME:") && line.includes("DATA:") && line.includes("TURMA:");

        if (isTitle) {
            return new Paragraph({
                children: [new TextRun({ text: line, bold: true, size: 28 })],
                spacing: { before: 240, after: 120 },
            });
        }
        return new Paragraph({
            children: [new TextRun({ text: line || '\u00A0', size: 24 })],
            alignment: isHeader ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
        });
    };
    
    const activityChildren: Paragraph[] = [];

    if (imageUrl) {
        try {
            const base64Data = imageUrl.split(',')[1];
            activityChildren.push(new Paragraph({
                children: [new ImageRun({ data: base64Data, transformation: { width: 10 * 360000, height: 6 * 360000 } })],
                alignment: AlignmentType.CENTER,
            }));
        } catch (e) { console.error("Could not add image to DOCX:", e); }
    }

    const { processedText, tableImages } = await processTablesInActivity(promptData.folhaDeAtividades);

    for (const line of processedText.split('\n')) {
        if (line.startsWith('[--TABLE_IMAGE_') && line.endsWith('--]')) {
             const tableImgData = tableImages[line];
             if (tableImgData) {
                 try {
                    const base64Data = tableImgData.split(',')[1];
                    const { width, height } = await getImageDimensions(tableImgData);
                    const aspectRatio = width / height;
                    const desiredWidthEmu = 16 * 360000; // 16cm
                    
                    activityChildren.push(new Paragraph({
                        children: [new ImageRun({ data: base64Data, transformation: { width: desiredWidthEmu, height: desiredWidthEmu / aspectRatio } })],
                        alignment: AlignmentType.CENTER,
                    }));
                 } catch (e) { console.error("Could not add table image to DOCX:", e); }
             }
        } else {
            activityChildren.push(createParagraph(line));
        }
    }

    const doc = new Document({
        styles: {
            paragraphStyles: [{
                id: "Normal", name: "Normal", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 24, font: "Calibri" },
                paragraph: { spacing: { after: 120 } }
            }]
        },
        sections: [{
            properties: {},
            children: [
                new Paragraph({ text: `Plano de Aula: ${promptData.conteudoTema}`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `Habilidade (BNCC): ${promptData.codigoAlfanumerico}`, heading: HeadingLevel.HEADING_3 }),
                new Paragraph({ children: [new TextRun({ text: promptData.habilidade, size: 22, italics: true })], spacing: { after: 400 } }),
                new Paragraph({ text: "Orientações para o Professor", heading: HeadingLevel.HEADING_1 }),
                ...promptData.planoDeAula.split('\n').map(createParagraph),
                new Paragraph({ children: [new PageBreak()] }),
                new Paragraph({ text: `Atividade: ${promptData.conteudoTema}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
                ...activityChildren,
            ],
        }],
    });

    return Packer.toBlob(doc);
};

export const generatePng = async (promptData: PedagogicalPrompt, imageUrl: string | null): Promise<Blob | null> => {
    const html2canvas = (await import('html2canvas')).default;
    const element = await renderPromptToHtmlElement(promptData, imageUrl);
    
    const canvas = await html2canvas(element, { scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    
    document.body.removeChild(element);
    
    return dataURLtoBlob(dataUrl);
};

export const generateJpg = async (promptData: PedagogicalPrompt, imageUrl: string | null): Promise<Blob | null> => {
    const html2canvas = (await import('html2canvas')).default;
    const element = await renderPromptToHtmlElement(promptData, imageUrl);
    
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    document.body.removeChild(element);
    
    return dataURLtoBlob(dataUrl);
};