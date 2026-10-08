/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standardizes any school name to use the elegant, abbreviated "E.M." prefix as requested by the user.
 * It replaces variants like "ESCOLA MUNICIPAL", "ESCOLA MUN", and "EM " with "E.M. ".
 * It also applies the exact custom name for the "PADRE MÁRIO ANTONIO BONOTTI - REDENTORISTA" school.
 */
export function formatSchoolName(name: string): string {
  if (!name) return '';
  let formatted = name.trim();

  // Special exact formatting override for Padre Mario Antonio Bonotti
  if (formatted.toUpperCase().includes('BONOTTI')) {
    return 'E.M. “PADRE MÁRIO ANTONIO BONOTTI - REDENTORISTA”';
  }

  // Format the name of EM PROFA MARIA MADUREIRA SALGADO DONA MINICA
  if (formatted.toUpperCase().includes('DONA MINICA')) {
    return 'E.M. PROFA MARIA MADUREIRA SALGADO "DONA MINICA"';
  }

  // Replace ESCOLA MUNICIPAL
  if (/^ESCOLA MUNICIPAL/i.test(formatted)) {
    formatted = formatted.replace(/^ESCOLA MUNICIPAL\s*/i, 'E.M. ');
  } else if (/^ESCOLA MUN/i.test(formatted)) {
    formatted = formatted.replace(/^ESCOLA MUN\s*/i, 'E.M. ');
  } else if (/^EM PROFA/i.test(formatted)) {
    formatted = formatted.replace(/^EM PROFA\s*/i, 'E.M. PROFA ');
  } else if (/^EM\s+/i.test(formatted)) {
    formatted = formatted.replace(/^EM\s+/i, 'E.M. ');
  }

  // Remove duplicate spaces and clean up
  return formatted.replace(/\s+/g, ' ').trim();
}
