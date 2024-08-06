export type DeckCard = {
  name: string
  amount: number
  set: string
  collectorNumber: string
  isFoil: boolean
  isEtched: boolean
  globalTags: string[]
  deckSpecificTags: string[]
}

// Note: some of these values are possibly null and incorrect but they are not used much in this website
type Legality = 'legal' | 'not_legal' | 'restricted' | 'banned'
export type ScryfallCard = {
  object: 'card'
  id: string
  oracle_id: string
  multiverse_ids: number[]
  mtgo_id: number
  mtgo_foil_id: number
  tcgplayer_id: number
  cardmarket_id: number
  name: string
  lang: string
  released_at: string
  uri: string
  scryfall_uri: string
  layout: string
  highres_image: boolean
  image_status: string
  image_uris: {
    small: string
    normal: string
    large: string
    png: string
    art_crop: string
    border_crop: string
  }
  mana_cost: string
  cmc: number
  type_line: string
  oracle_text: string
  power: string
  toughness: string
  colors: string[]
  color_identity: string[]
  keywords: string[]
  legalities: {
    standard: Legality
    future: Legality
    historic: Legality
    gladiator: Legality
    pioneer: Legality
    explorer: Legality
    modern: Legality
    legacy: Legality
    pauper: Legality
    vintage: Legality
    commander: Legality
    oathbreaker: Legality
    historicbrawl: Legality
    alchemy: Legality
    paupercommander: Legality
    duel: Legality
    oldschool: Legality
    premodern: Legality
    predh: Legality
  }
  games: string[]
  reserved: boolean
  foil: boolean
  nonfoil: boolean
  finishes: string[]
  oversized: boolean
  promo: boolean
  reprint: boolean
  variation: boolean
  set_id: string
  set: string
  set_name: string
  set_type: string
  set_uri: string
  set_search_uri: string
  scryfall_set_uri: string
  rulings_uri: string
  prints_search_uri: string
  collector_number: string
  digital: boolean
  rarity: string
  flavor_text: string
  card_back_id: string
  artist: string
  artist_ids: string[]
  illustration_id: string
  border_color: 'black' | 'white' | 'borderless' | 'silver' | 'gold'
  frame: string
  security_stamp: string
  full_art: boolean
  textless: boolean
  booster: boolean
  story_spotlight: boolean
  edhrec_rank: number
  penny_rank: number
  prices: {
    usd: string | null
    usd_foil: string | null
    usd_etched: string | null
    eur: string | null
    eur_foil: string | null
    tix: string | null
  }
  related_uris: {
    gatherer: string
    tcgplayer_infinite_articles: string
    tcgplayer_infinite_decks: string
    edhrec: string
  }
  purchase_uris: {
    tcgplayer: string
    cardmarket: string
    cardhoarder: string
  }
  card_faces?: {
    artist: string
    cmc: number
    color_indicator: string[]
    colors: string[]
    flavor_text: string
    illustration_id: string
    image_uris?: {
      small: string
      normal: string
      large: string
      png: string
      art_crop: string
      border_crop: string
    }
    layout: string
    mana_cost: string
    name: string
    oracle_id: string
    oracle_text: string
    power: string
    printed_name: string
    printed_text: string
    printed_type_line: string
    toughness: string
    type_line: string
    watermark: string
  }[]
}
