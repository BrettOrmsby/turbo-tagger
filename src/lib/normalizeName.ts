export default function normalizeName(cardName: string): string {
  return cardName.split('/')[0].trim()
}
