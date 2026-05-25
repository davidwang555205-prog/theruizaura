export const SNEAKER_SHAPE_LOCK_PRIORITY = `Sneaker shape lock priority:
The uploaded THERUIZ AURA sneaker reference has the highest priority in the image.

The model, pose, trouser hem, foot position, camera angle, mirror reflection, and surrounding scene must adapt to the sneaker shape - not the other way around.

Do not let the foot, pose, pants, perspective, mirror angle, or body movement deform the sneaker.

If there is any conflict between natural pose and preserving the shoe, prioritize preserving the exact sneaker shape.

The sneaker must remain structurally identical to the uploaded reference:
- same toe shape
- same toe box height
- same outsole thickness
- same outsole curve
- same side panel proportion
- same heel height
- same collar opening
- same tongue shape
- same lace thickness
- same lace placement
- same material panels
- same stitching positions
- same color blocking
- same visual weight

The shoe may be naturally worn on foot, but it must not be reshaped by the foot.`;

export const NO_SNEAKER_RECONSTRUCTION_CONTROL = `No sneaker reconstruction control:
Do not reinterpret, redesign, simplify, stylize, or reconstruct the sneaker.

The image generation should treat the uploaded shoe as a fixed object with a fixed structure.

Do not change the sneaker into:
- a running shoe
- a chunky sneaker
- a skate shoe
- a tennis shoe
- a casual canvas shoe
- a generic white sneaker
- a fashion sneaker
- a slimmer shoe
- a wider shoe
- a softer collapsed shoe
- a shoe with different outsole height
- a shoe with different panel layout

Do not create a new shoe based on the idea of the reference. Preserve the exact reference shoe.

The sneaker must not be compressed, stretched, melted, softened, collapsed, inflated, sharpened, simplified, or re-proportioned.`;

export const HIGH_RISK_ON_FOOT_POSE_PROTECTION = `High-risk on-foot pose protection:
This pose is structurally risky for footwear generation. Prioritize clean sneaker structure over dramatic action.

Keep the pose simple, slow, and physically believable.

Avoid complex bending, twisting, pulling, crossing, crouching, or transitional foot-entry moments that may deform the shoe.

The foot must not push through the shoe upper, tongue, collar, outsole, or heel counter.

The shoe must not bend unnaturally to match the pose.

The trouser hem must stay outside the shoe opening and must not merge with the collar or tongue.

If the action causes visual conflict, simplify the action into a calmer, safer version while preserving the idea of the movement.`;

export const SNEAKER_STRUCTURAL_CHECKLIST = `Sneaker structural checklist:
Before finalizing the image, ensure that the sneaker keeps:
- correct left and right shoe orientation
- complete toe box
- clean outsole line
- stable heel counter
- natural collar opening
- visible tongue placement
- correct lace route
- no fused lace and tongue
- no foot breaking through upper
- no pants entering shoe opening
- no sole sinking into floor
- no mirror or perspective distortion changing the shoe shape
- no mismatched pair
- no missing shoe parts
- no melted material panels

The sneaker should look wearable, real, and structurally clean.`;

export const TROUSER_HEM_AND_SHOE_COLLAR_SEPARATION_CONTROL = `Trouser hem and shoe collar separation control:
The trouser hem must remain visually separate from the sneaker collar.

The pants may lightly touch, hover above, or naturally drape near the shoe, but must not merge into the shoe opening.

Avoid:
- pants entering the shoe collar
- pants fused with tongue
- pants hiding the shoe opening completely
- pants cutting through the laces
- trouser fabric melting into the upper
- hemline clipping through ankle or collar
- overly long trousers covering the whole shoe

Prefer:
- ankle-length trousers
- cropped straight-leg trousers
- slightly relaxed denim that stops above the shoe
- clean trouser break that still reveals the shoe shape`;

export const SHOE_SAFE_CAMERA_ANGLE_CONTROL = `Shoe-safe camera angle control:
Use camera angles that preserve sneaker shape.

Prefer:
- eye-level lifestyle angle
- natural 35mm to 50mm perspective
- slight 3/4 front-side shoe view
- side view where outsole and toe shape remain readable
- standing or seated composition with stable foot placement

Avoid:
- extreme top-down angle
- extreme low-angle feet shot
- wide-angle mirror distortion
- fisheye lens
- close-up foot distortion
- aggressive fashion perspective
- motion blur around shoes
- cropped shoe frame
- tilted mirror reflection that stretches the shoes`;

export const MIRROR_SHOE_PRESERVATION_CONTROL = `Mirror shoe preservation control:
In mirror selfie scenes, the mirror reflection must not change the sneaker shape.

The shoe should not become elongated, narrowed, melted, blurred, or simplified in reflection.

The full sneaker outline must remain readable despite mirror distance.

Avoid mirror edge cutting through the shoe, warped reflection around feet, and floor reflection distorting the outsole.`;
