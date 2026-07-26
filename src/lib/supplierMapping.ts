import { Supplier, SupplierType } from '../types.ts';

/**
 * Row ⇄ Supplier mapping for the `suppliers` table.
 *
 * Kept out of SupplierContext.tsx so non-context callers (the /preview/:token
 * route, which reads a row through the get_supplier_by_preview_token RPC rather
 * than the context) can share exactly the same mapping.
 */

export const mapRowToSupplier = (row: Record<string, unknown>): Supplier => ({
  id: row.id as string,
  name: (row.name as string) || '',
  type: (row.type as SupplierType) || SupplierType.OtherTravelSupplier,
  logoUrl: (row.logo_url as string) || '',
  bannerUrl: (row.banner_url as string) || '',
  shortDescription: (row.short_description as string) || '',
  longDescription: (row.long_description as string) || '',
  avatarImageUrl: (row.avatar_image_url as string) || '',
  websiteUrl: (row.website_url as string) || '',
  knowledgeBaseUrl: (row.knowledge_base_url as string) || '',
  knowledgeBaseText: (row.knowledge_base_text as string) || '',
  geminiVoiceName: (row.gemini_voice_name as string) || 'Zephyr',
  videoUrl: (row.video_url as string) || undefined,
  elevenLabsAgentId: (row.eleven_labs_agent_id as string) || undefined,
  useElevenLabs: (row.use_eleven_labs as boolean) || false,
  hedra_avatar_id: (row.hedra_avatar_id as string) || undefined,
  isDemo: row.is_demo !== false,
  isPublished: row.is_published === true,
  previewToken: (row.preview_token as string) || undefined,
});

export const mapSupplierToRow = (s: Omit<Supplier, 'id'>) => ({
  name: s.name,
  type: s.type,
  logo_url: s.logoUrl || null,
  banner_url: s.bannerUrl || null,
  short_description: s.shortDescription || null,
  long_description: s.longDescription || null,
  avatar_image_url: s.avatarImageUrl || null,
  website_url: s.websiteUrl || null,
  knowledge_base_url: s.knowledgeBaseUrl || null,
  knowledge_base_text: s.knowledgeBaseText || null,
  gemini_voice_name: s.geminiVoiceName || 'Zephyr',
  video_url: s.videoUrl || null,
  eleven_labs_agent_id: s.elevenLabsAgentId || null,
  use_eleven_labs: s.useElevenLabs || false,
  hedra_avatar_id: s.hedra_avatar_id || null,
  is_demo: s.isDemo !== false,
  // Carry the real value through. This used to be hardcoded `true`, which meant
  // ANY admin edit silently republished an unlisted supplier. Defaults to false
  // (matching the DB default) so a profile is never published by omission.
  is_published: s.isPublished === true,
  // preview_token is deliberately absent: it is managed in SQL, and omitting it
  // from the payload leaves an existing token untouched on update.
});
