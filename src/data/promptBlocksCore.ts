import type { AgeRange } from "../types";

export const BRAND_RULE = `THERUIZ AURA 92-point visual = The Row's restrained structure + Chloé's feminine ease + Le Labo's tactile material authenticity.

Final direction: Quiet Warm Luxury / 温感静奢.

The image should feel clean but not cold, premium but not distant, feminine but not sweet, relaxed but not careless, real but not ordinary.

Visual keywords: cream-white, warm beige, soft stone, linen texture, natural daylight, low saturation, quiet luxury, relaxed elegance, tactile authenticity, believable daily life, warm restraint, calm negative space.`;

export const CUSTOMER_FEELING_CORE = `Customer feeling core:
The image should express the emotional value of THERUIZ AURA: a woman can leave home without overthinking her outfit, walk through the whole day without looking tired or messy, feel comfortable without looking careless, and appear clean, composed, tasteful, and quietly put together.

The final image should make the customer feel: this pair of shoes can help me leave home easily and still look composed through the whole day.`;

export const UNIFIED_CONTROL_PROMPT = `Unified control prompt:
Based on the uploaded THERUIZ AURA sneaker reference image, create a premium 92-point lifestyle visual in the brand's "Quiet Warm Luxury" style.

Strictly preserve the real shoe shape, outsole thickness, toe shape, lace thickness, proportions, materials, texture, stitching, and exact color of the uploaded shoe. Do not redesign the sneaker.

The image should express THERUIZ AURA's brand language: cream-white, warm beige, soft stone, linen, natural daylight, quiet luxury, refined daily life, relaxed elegance, breathable composition, and believable daily sophistication.

The mood should feel like The Row's restraint, Chloé's feminine ease, and Le Labo's tactile authenticity, translated into THERUIZ AURA's own visual system.

The image must not look like a generic e-commerce shoe photo. The sneaker should naturally belong in a refined, real, low-saturation lifestyle environment for a tasteful modern woman.

If a model appears, use a refined Asian or part-Asian woman with natural, understated presence. Avoid exaggerated posing, strong makeup, influencer style, over-styled fashion attitude, overly youthful aesthetics, or overly commercial expressions.

Use soft daylight, subtle shadows, minimal styling, calm negative space, warm neutral tones, and a believable lifestyle atmosphere.

The logo "THERUIZ AURA" may appear small and discreetly in a suitable corner or lower blank area, like a quiet brand signature.

Important: keep the scene elegant but believable, refined but not cold, feminine but not sweet, elevated but not overly commercial.`;

export const PRODUCT_ACCURACY_CONTROL = `Product accuracy control:
The uploaded sneaker is the only product reference.

Strictly preserve the sneaker's original shape, toe shape, outsole thickness, sole structure, lace thickness, tongue shape, stitching, material texture, color, and overall proportion.

Do not redesign the sneaker.
Do not change it into another shoe type.
Do not make it look like a running shoe, chunky sneaker, skate shoe, fashion sneaker, or generic white sneaker.
Do not change the color temperature of the shoe.
Do not make the outsole thicker or thinner.
Do not enlarge or shrink the shoe unnaturally.

The shoe must look like the exact uploaded THERUIZ AURA sneaker in every image.`;

export const MULTI_IMAGE_CONSISTENCY_CONTROL = `Multi-image consistency control:
If generating 3 images in one set, use the exact same model identity across all images.

The model must keep the same face, same age appearance, same hairstyle, same hair color, same makeup style, same body shape, same outfit, same bag, same accessories, same clothing details, same trouser length, same sleeve length, and same overall styling in every image.
Gaze direction, eye focus, facial lighting, and subtle expression must shift naturally to match the body angle and action in each frame; the eyes should look alive and distinct rather than cloned across images.

Do not change the model's identity from image to image.
Do not change the outfit.
Do not change the hairstyle.
Do not change the hair color.
Do not change the clothing details, bag, jewelry, or accessories.

Across the 3-image set, the woman should look like the same person wearing the same outfit in different daily scenes.

Only the scene, pose, body movement, framing, camera distance, and composition may change.

The final result should feel like one coherent editorial shoot showing the same woman moving through 3 different daily moments, not separate unrelated images.

Across the 3-image set, keep the same body shape, same height impression, same shoulder width, same leg length, same waist and hip proportion, and same overall silhouette. Do not let the model become taller, thinner, younger, older, or differently shaped between images.`;

export const AGE_PROMPTS: Record<AgeRange, string> = {
  "25-35":
    "Use a refined urban Asian or part-Asian woman aged 30-45. She should look tasteful, calm, capable, natural, and understated.",
  "30-45":
    "Use a refined urban Asian or part-Asian woman aged 30-45. She should look tasteful, calm, capable, softly feminine, and realistic, with quiet confidence and daily elegance.",
  "40-55":
    "Use a refined urban Asian or part-Asian woman aged 30-45. She should look elegant, composed, natural, modern, and quietly confident.",
  auto:
    "If age range is set to automatic, use a refined Asian or part-Asian woman aged 30-45."
};

export const BODY_PROPORTION_CONTROL = `Model body proportion and silhouette control:
The model should have realistic, elegant, and natural body proportions suitable for THERUIZ AURA's refined urban female customer.

She should look like a real 30-45 year old urban woman with good taste, calm confidence, and a healthy natural body, not an exaggerated runway model, influencer, teenager, athlete, or fashion editorial mannequin.

Keep the body silhouette slim but not overly thin, refined but not fragile, feminine but not exaggerated, mature but not heavy, comfortable but not careless.

Use natural human proportions: normal head-to-body ratio, realistic shoulder width, natural waist and hip proportion, believable leg length, normal calf shape, natural ankle size, realistic foot size, balanced posture, relaxed body tension.

Avoid extremely long legs, nine-head fashion model proportions, oversized feet, tiny ankles, overly thin calves, exaggerated waist-to-hip ratio, influencer body shape, runway model posture, stiff mannequin body, athletic sports body, overly youthful body impression, overly mature heavy body, plastic AI body, distorted joints, broken knees, twisted ankles, and unnatural torso length.

The model should appear elegant because of styling, posture, light, clothing, and atmosphere, not because of unrealistic body exaggeration.

The final body silhouette should feel like a tasteful real woman who can wear these sneakers in daily life: comfortable, composed, clean, refined, and quietly confident.`;

export const AGE_BODY_SUPPLEMENTS: Record<AgeRange, string> = {
  "25-35":
    "30-45 body supplement: Use a refined urban female silhouette with natural proportions, relaxed posture, and realistic daily movement.",
  "30-45":
    "30-45 body supplement: Use a refined core urban female body silhouette, natural, balanced, softly feminine, healthy, and realistic. She should look capable, tasteful, and comfortable in daily movement.",
  "40-55":
    "30-45 body supplement: Use a refined urban female silhouette that feels elegant, composed, natural, modern, and quietly confident.",
  auto:
    "Automatic age body supplement: use a refined 30-45 year old urban female silhouette with realistic proportions and calm daily elegance."
};

export const HUMAN_PROPORTION_CONTROL = `Human proportion control:
Keep the model's body proportions realistic and natural. The woman should look like a real refined Asian or part-Asian woman, not an exaggerated fashion model.

Use natural human proportions: normal head-to-body ratio, natural shoulder width, realistic waist and hip proportions, natural leg length, normal ankle size, and realistic foot size.

Do not elongate the legs. Do not make the feet oversized. Do not make the ankles too thin or twisted. Do not create distorted knees, strange calf shapes, broken joints, overly long thighs, or unrealistic model proportions.

The sneakers must fit the feet naturally and appear in a believable size. The shoe should not look enlarged, stretched, compressed, or disconnected from the body.

Avoid wide-angle distortion, extreme low-angle shots, fisheye lens effects, over-stretched legs, and unrealistic editorial body proportions.

The model should look elegant because of posture, styling, lighting, and atmosphere, not because of exaggerated body proportions.`;

export const ON_FOOT_PROPORTION_CONTROL = `On-foot proportion control:
For on-foot images, keep the feet and sneakers in realistic proportion to the body. The camera angle should not make the shoes appear too large or the legs appear unnaturally long.

Use a medium-distance or natural lifestyle angle, not an extreme low-angle or wide-angle fashion shot.

The legs should look relaxed and natural, with normal ankle thickness, realistic calf shape, and believable foot placement.

The sneakers should be clearly visible but not exaggerated in size. Avoid stretched feet, long toes, distorted soles, broken ankles, twisted knees, or unnatural standing posture.

The final image should feel like a real woman wearing the shoes in daily life, not a stylized AI fashion pose.`;
