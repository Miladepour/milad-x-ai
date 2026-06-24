export const PAPER_CUT_COLLAGE_PROMPT_TEMPLATE = `Act as a professional image prompt engineer.

I will upload one reference image. Analyse the uploaded image carefully and create one complete image generation prompt that transforms it into a paper cut collage artwork.

Use the uploaded image as the main visual reference, but follow the custom details below.

CUSTOM DETAILS TO FOLLOW:

Main subject:
[Write what the main subject should be. Example: old Tehran, football strategy, AI leaders, financial system, fashion portrait]

Text to include:
[Write the exact text that must appear in the image. Example: تهران قدیم]
If no text is needed, write: No text.

Colour palette:
[Write the colours you want. Example: beige, orange, black and white]
Use these colours as the main palette and keep the image visually balanced.

Main elements to include:
[Write the important objects, people, places, symbols, or details you want in the image. Example: Azadi Tower, Peykan taxi, street sign, old city textures]

Extra elements to add:
[Write any supporting details. Example: torn paper circles, grid lines, vintage trees, city textures, football pitch, fans, data lines, receipts]

Mood:
[Write the feeling you want. Example: nostalgic, premium, dramatic, cultural, playful, futuristic, editorial]

Aspect ratio:
[Write the aspect ratio. Example: 16:9 landscape, 4:5 Instagram post, 9:16 story, portrait poster]

Text rules:
Only include the exact text I wrote above.
Do not add extra text.
Do not add logos.
Do not add branding.
Do not add watermark.

Now create the final image generation prompt.

The final prompt must:
Analyse the uploaded image and preserve its strongest visual idea, layout, and atmosphere.
Transform the image into a premium paper cut collage artwork.
Use layered cutout paper elements, torn paper edges, handmade paper texture, realistic paper shadows, overlapping magazine cutouts, subtle grain, halftone texture, distressed print details, and editorial poster composition.
Keep the main subject clear and visually strong.
Use the colour palette I provided.
Include the main elements and extra elements I provided.
Make the composition balanced, artistic, and professional.
Make sure the final prompt is detailed enough for an image generation tool.

Final output:
Give me only one complete image generation prompt.
Do not explain.
Do not give options.
Do not generate the image.`;

export const PAPER_CUT_COLLAGE_ANIMATION_PROMPT = `Animate the uploaded image as a paper collage assembly.

Start from a plain empty background with only subtle texture.

Bring every separate piece of the collage into the scene one by one.

Each cutout, paper layer, object, character, detail, and background element should slide, drop, or gently float into its final position.

Make the movement feel like real physical paper pieces being placed together.

Use natural paper shadows, torn edges, slight depth, soft parallax, and small imperfections.

The animation should gradually build from an empty background into the full final composition.

Keep the final frame exactly the same as the uploaded reference image.

Do not add new elements.

Do not remove any elements.

Do not change the composition.

Do not change the characters, faces, objects, colours, or style.

Use smooth cinematic motion, light camera movement, subtle zoom, and realistic paper texture.

The final result should feel like a premium handmade paper collage coming together piece by piece.

No text.

No logo.

No extra graphics.

Keep the same aspect ratio as the uploaded image.`;
