# Family2 shared authoring source

Copy exactly `family.js`, `family.css`, `playwrite-es.ttf`, `OFL.txt` into each independent game's local family-v2 directory. Version2.0.0. No runtime fetch from another app. Font source is the same original Playwrite ES bundled in Cole Aventura under OFL. Do not transform assets or remove license.

```html
<link rel="stylesheet" href="family-v2/family.css?v=2.0.0">
<script src="family-v2/family.js?v=2.0.0" data-game="my-game" defer></script>
```

Place `data-family-slot` in an always-visible header/layout position. Mark native audio/settings buttons `data-family-setting`: they are moved as LIGHT DOM slots, preserving IDs/listeners/styles, and invisible until parent multiplication. Never use selector queries assuming their old parent. Register native freeze/resume/home only after native state exists:

```js
FamilyV2.register({pause:freezeAdult, resume:restoreAdult, home:showNativeMenu});
FamilyV2.award('unique-native-event',1);
```

Callbacks must preserve manual pause, game clocks, learning gate and held input. Home stays in the same URL/game. Catalogue link only in Adult settings. `fontReady`, `fontFamily`, `touch`, `read`, and `version` are exposed. Renderers must select the family explicitly for canvas/engine text; DOM CSS alone is insufficient.

Lightweight bounded effects and native theme/pause wrappers do not prove mechanics or device performance. Per-game tests remain mandatory. Score storage is local per-game and inactivity1h; read does not extend inactivity. Same-tab repeated award ID is idempotent; IDs are namespaced per page run. No transaction guarantee across simultaneous tabs.

Final adversarial corrections: educational lock closes Adult modal to avoid top-layer deadlock; shadow keyboard stopped before native gameplay; cookie authoritative after quota failure; real keyboard/continuous-pointer activity throttled; unique per-race event IDs. Shell revision2 in scoped worker cache, public API remains2.0.0.
