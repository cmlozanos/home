# Refinement delivery —23November2026

User priority: shared linked school font everywhere, and favorite Turbo loops/ramp gameplay. Native19game pass, no new engine/font/CDN/paid asset. More depth/materials/light, not photorealistic heavyweight graphics.

|Repo|Branch|Remote-verified commit|
|---|---|---|
|home|main|`36f50fd6d1d16e9c74c45867552b1baecf4b0456`|
|games|main|`3bde89249ecc498d3d3918574c24e6038787d93f`|
|banana-party|master|`e235312c7b682c73e44292c078069b03246cbc4e`|
|jump-the-car|master|`6af3ce6cf377b9c2171d91ff6e147ba749d679c5`|
|fancy-jumping-car|master|`05220cb071e1f8c2b781e72621029dfdbeee5fea`|
|world-of-joy|master|`190394e50ce0d4c0e66c86806179aef6d9dbed6e`|
|turbo-loop-legends|main|`1b4662540f940e267941c65b4020ebfd646f5e61`|

Home runtime36f50fd. Subsequent acceptance-doc commits need no runtime rebuild evidence repetition. v2.0.0 tags remain immutable; this refinement is delivered as subsequent commits, not silently rewriting releases. Games gitlinks aligned to four standalone exact commits.

Turbo:86targeted model tests including272compatible routes,22Chromium/WebKit integration checks,2final appearance checks and two real heavy-car runs both loop types/flight/landing/7checkpoints/finish without reappearance. See Turbo docs/refinement/NATIVE.md. Static95 checks are not actual oldengine or physicalTablet acceptance this pass.

Main:34coreChromium/WebKit,44Home entry/font/nativeHome/Adult/offline tablet+landscape,2real Highway/Karts races,9focused appearance/Home/viewport earlier and4finalOrbit. Worker evidence pergame under docs/refinement; Home activities/racing under evidence/. Models/cache/font budgets green. Public19URLs smoke passed. Turbo deployment45245215041 succeeded:90unit tests,33browser passed/1explicit skip; includes real-time heavycar journeys. Live published750×342race independently checked loaded linked font, normal-case Turbo label, native day/night switch, no page errors, screenshot retained.

Pending limits:physicalTab4 GPU/RAM/thermal/touch, child acceptance of wider shortscreen Turbo camera, Rubik camera and exhaustive every-track browser play. No zero-bug or universal typography-state guarantee: actual coverage separated DOM/engine/source/render.

## Final local matrix reconciliation
Home current runtime local tablet full134/134passed. CI phone131passed/3skipped, landscape131passed/3skipped, Safari118passed/16skipped. Tablet CI first attempt exceeded20min job budget because external browser installation consumed~17min, then cancelled mid-suite; not a failed assertion or a green CI claim. Only cancelled tablet job requeued with same source; existing successful jobs are reused. All guards retained and local full134pass evidence saved.

## User correction: local validation only
The user explicitly clarified GitHub is for web publication, not test acceptance. All further acceptance uses local checks and direct browser interaction; no waiting on remote jobs. Historical CI records above remain provenance only, not a required gate. Local full tablet134/134 passed on exact Home runtime36f50fd; focused local/WebKit/model/gameplay evidence is authoritative. Turbo receives an additional locally verified play-feel pass under explicit consent.

## Latest local corrective pass
Turbo dynamic camera makes the car larger on ordinary short-screen terrain while zooming out around actual loop radius and high jumps; loop safe area incorporates HUD/controls. Mixed input aggregation fixes keyboard/touch releases and alternate keys;36newinput tests,127localunit overall. Two real-input heavycar races repeated with final camera:both loops,jump,landing,7checkpoints,finish,0respawns. Native singleHome and3responsive/browsercontrol checks green. Shared36localChromium/WebKit plus22allHomeintegration and exact19kits green. GitHub only builds/publishes; remote test workflow removed.

Acceptance limits: graphics are richer child-readable2D/3Dmaterials, not photorealism; physicalTab4,allcampaigncombinations and no-bug guarantee not claimed. Mandatory school font remains original local bytes, DOM and engine text verified in bounded samples.
