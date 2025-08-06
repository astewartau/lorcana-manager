import { consolidatedCards } from '../data/allCards';
import { ConsolidatedCard } from '../types';

export interface DreambornCSVRow {
  Normal: string;
  Foil: string;
  Name: string;
  Set: string;
  'Card Number': string;
  Color: string;
  Rarity: string;
  Price: string;
  'Foil Price': string;
}

export interface ImportedCard {
  consolidatedCard: ConsolidatedCard;
  normalQuantity: number;
  foilQuantity: number;
  isEnchanted: boolean;
}

export const parseDreambornCSV = (csvContent: string): DreambornCSVRow[] => {
  console.log('Starting CSV parse...');
  console.log('Content length:', csvContent.length);
  console.log('First 500 chars:', csvContent.substring(0, 500));
  
  // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
  const lines = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').filter(line => line.trim().length > 0);
  
  console.log('Total lines found:', lines.length);
  console.log('First line (headers):', lines[0]);
  console.log('Second line (first data):', lines[1] || 'NO SECOND LINE');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Try both tab and comma as separators
  let separator = '\t';
  if (lines[0].includes('\t') && lines[0].split('\t').length >= 9) {
    separator = '\t';
  } else if (lines[0].includes(',') && lines[0].split(',').length >= 9) {
    separator = ',';
  } else {
    // Fallback: use whichever gives more columns
    const tabCount = lines[0].split('\t').length;
    const commaCount = lines[0].split(',').length;
    separator = tabCount > commaCount ? '\t' : ',';
  }
  
  console.log('Using separator:', separator === '\t' ? 'TAB' : 'COMMA');
  
  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
  console.log('Headers found:', headers);
  
  // More flexible header matching
  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    const cleanHeader = header.toLowerCase().trim();
    if (cleanHeader.includes('normal') || cleanHeader === 'normal') {
      headerMap['Normal'] = index;
    } else if (cleanHeader.includes('foil') && !cleanHeader.includes('price')) {
      headerMap['Foil'] = index;
    } else if (cleanHeader.includes('name') && !cleanHeader.includes('set')) {
      headerMap['Name'] = index;
    } else if (cleanHeader.includes('set')) {
      headerMap['Set'] = index;
    } else if (cleanHeader.includes('card') && cleanHeader.includes('number')) {
      headerMap['Card Number'] = index;
    } else if (cleanHeader.includes('color')) {
      headerMap['Color'] = index;
    } else if (cleanHeader.includes('rarity')) {
      headerMap['Rarity'] = index;
    } else if (cleanHeader.includes('price') && !cleanHeader.includes('foil')) {
      headerMap['Price'] = index;
    } else if (cleanHeader.includes('foil') && cleanHeader.includes('price')) {
      headerMap['Foil Price'] = index;
    }
  });
  
  console.log('Header mapping:', headerMap);
  
  const requiredFields = ['Normal', 'Foil', 'Name'];
  const missingFields = requiredFields.filter(field => headerMap[field] === undefined);
  if (missingFields.length > 0) {
    throw new Error(`Missing required columns: ${missingFields.join(', ')}. Found headers: ${headers.join(', ')}`);
  }

  const rows: DreambornCSVRow[] = [];
  let totalProcessed = 0;
  let cardsWithQuantity = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
    totalProcessed++;
    
    if (totalProcessed <= 5) {
      console.log(`Row ${i + 1} values:`, values);
    }
    
    // Build row object using header mapping
    const row: any = {};
    Object.entries(headerMap).forEach(([fieldName, columnIndex]) => {
      row[fieldName] = values[columnIndex] || '';
    });

    // Parse quantities with better error handling
    const normalQtyStr = (row.Normal || '0').toString().trim();
    const foilQtyStr = (row.Foil || '0').toString().trim();
    
    const normalQty = parseInt(normalQtyStr) || 0;
    const foilQty = parseInt(foilQtyStr) || 0;
    
    if (totalProcessed <= 5) {
      console.log(`Row ${i + 1} quantities - Normal: '${normalQtyStr}' -> ${normalQty}, Foil: '${foilQtyStr}' -> ${foilQty}`);
    }
    
    if (normalQty > 0 || foilQty > 0) {
      cardsWithQuantity++;
      rows.push(row as DreambornCSVRow);
      
      if (cardsWithQuantity <= 5) {
        console.log(`Found card with quantity: ${row.Name}, Normal: ${normalQty}, Foil: ${foilQty}`);
      }
    }
  }
  
  console.log(`Processed ${totalProcessed} total rows, found ${cardsWithQuantity} cards with quantities > 0`);
  console.log(`Final rows to return: ${rows.length}`);

  return rows;
};

export const matchCardToDatabase = (csvRow: DreambornCSVRow): ConsolidatedCard | null => {
  const { Name: csvName, Set: csvSet, Rarity: csvRarity } = csvRow;
  
  // Clean the name - remove extra spaces and standardize
  const cleanName = csvName.trim();
  
  // Find matching consolidated card
  const matches = consolidatedCards.filter(consolidatedCard => {
    const { baseCard, variants } = consolidatedCard;
    
    // Check if the full name matches
    if (baseCard.fullName === cleanName) {
      return true;
    }
    
    // Check if any variant matches (for enchanted cards)
    if (csvRarity === 'Enchanted' && variants.enchanted) {
      return variants.enchanted.fullName === cleanName;
    }
    
    // Check if special variants match
    if (csvRarity === 'Special' && variants.special) {
      return variants.special.some(special => special.fullName === cleanName);
    }
    
    return false;
  });

  if (matches.length === 0) {
    console.warn(`Could not find match for card: ${cleanName} (Set: ${csvSet}, Rarity: ${csvRarity})`);
    return null;
  }

  if (matches.length > 1) {
    console.warn(`Multiple matches found for card: ${cleanName}, using first match`);
  }

  return matches[0];
};

export const importDreambornCollection = (csvContent: string): ImportedCard[] => {
  try {
    console.log('=== STARTING DREAMBORN IMPORT ===');
    const csvRows = parseDreambornCSV(csvContent);
    console.log(`CSV parsing complete. Found ${csvRows.length} rows with quantities.`);
    
    const importedCards: ImportedCard[] = [];
    let matchedCards = 0;
    let unmatchedCards = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      
      if (i < 5) {
        console.log(`Processing row ${i + 1}:`, {
          name: row.Name,
          normal: row.Normal,
          foil: row.Foil,
          rarity: row.Rarity
        });
      }
      
      const consolidatedCard = matchCardToDatabase(row);
      if (!consolidatedCard) {
        unmatchedCards++;
        if (unmatchedCards <= 5) {
          console.log(`Could not match card: ${row.Name}`);
        }
        continue;
      }

      matchedCards++;
      const normalQuantity = parseInt(row.Normal || '0') || 0;
      const foilQuantity = parseInt(row.Foil || '0') || 0;
      const isEnchanted = row.Rarity === 'Enchanted';

      importedCards.push({
        consolidatedCard,
        normalQuantity,
        foilQuantity,
        isEnchanted
      });
      
      if (matchedCards <= 5) {
        console.log(`Matched card: ${row.Name} -> ${consolidatedCard.fullName}, Normal: ${normalQuantity}, Foil: ${foilQuantity}`);
      }
    }
    
    console.log(`=== IMPORT SUMMARY ===`);
    console.log(`Total CSV rows with quantities: ${csvRows.length}`);
    console.log(`Successfully matched: ${matchedCards}`);
    console.log(`Could not match: ${unmatchedCards}`);
    console.log(`Final imported cards: ${importedCards.length}`);

    return importedCards;
  } catch (error) {
    console.error('Error importing Dreamborn collection:', error);
    throw error;
  }
};

export const generateImportSummary = (importedCards: ImportedCard[]): string => {
  const totalCards = importedCards.reduce((sum, card) => 
    sum + card.normalQuantity + card.foilQuantity, 0
  );
  
  const uniqueCards = importedCards.length;
  const enchantedCount = importedCards.filter(card => card.isEnchanted).length;
  
  return `Successfully imported ${totalCards} cards (${uniqueCards} unique cards, ${enchantedCount} enchanted variants)`;
};