# Context

The user imported 6 Figma screens for a civic-reporting app called **Paracatu360**. The task is to structure them into a working navigable app. Each screen corresponds to a tab in the bottom navigation bar (Início, Mapa, +, Atividade, Perfil), plus a detail screen reached by tapping an occurrence card.

The current `imports/index.tsx` holds only the last-imported snippet (`Ocorrencia`). All 6 full screens are available in the conversation history and must be reconstructed in `src/screens/`.

---

## Screens to build

| Screen | File | Trigger |
|--------|------|---------|
| 01 · Início | `src/screens/Inicio.tsx` | "Início" tab |
| 02 · Nova Ocorrência | `src/screens/NovaOcorrencia.tsx` | "＋" tab |
| 03 · Detalhe | `src/screens/Detalhe.tsx` | Tapping an occurrence card |
| 04 · Atividade | `src/screens/Atividade.tsx` | "Atividade" tab |
| 05 · Perfil | `src/screens/Perfil.tsx` | "Perfil" tab |
| 06 · Mapa | `src/screens/Mapa.tsx` | "Mapa" tab |

---

## Implementation plan

### 1. Wire Inter font — `src/index.css`

Add Google Fonts CSS2 `@import` **before** the Tailwind import for all three Inter weights (Regular 400, SemiBold 600, Bold 700), then declare three `@font-face` blocks using the quoted `cssFamily` names (`Inter:Regular`, `Inter:Bold`, `Inter:Semi Bold`) that the imported code references.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
@import 'tailwindcss';
```

Then declare:
```css
@font-face { font-family: 'Inter:Regular'; src: local('Inter'); font-weight: 400; }
@font-face { font-family: 'Inter:Bold'; src: local('Inter'); font-weight: 700; }
@font-face { font-family: 'Inter:Semi Bold'; src: local('Inter'); font-weight: 600; }
```

### 2. Shared navigation — `src/components/Navegacao.tsx`

Extract the `Navegacao` component (shared across all screens) into a standalone component. Accept an `activeTab` prop and an `onNavigate` callback so the parent can control navigation state.

### 3. Shared header — `src/components/Cabecalho.tsx`

Extract the repeated `Cabeçalho` block (logo + city + prototype label) as a shared component.

### 4. Create screen files in `src/screens/`

Each screen file receives the exact JSX from the imported Figma code. Differences from the raw import:
- Replace inline `Navegacao` with the shared `src/components/Navegacao.tsx`, passing active tab.
- Replace inline `Cabeçalho` with the shared component.
- The `Inicio.tsx` occurrence cards get an `onClick` prop wired to navigate to the Detalhe screen.
- The `NovaOcorrencia.tsx` "Registrar problema" button triggers navigation back to Início.
- The `Mapa.tsx` references the map image via `import imgMapa from "@/imports/8c6226c3f6130d9d0b9b971f7d598b626029572d.png"` and SVG paths via `import svgPaths from "@/imports/svg-fgppstdvre"`.
- The `NovaOcorrencia.tsx` references SVG paths via `import svgPaths from "@/imports/svg-4r6l0jr5e2"`.
- The `Perfil.tsx` references SVG paths via `import svgPaths from "@/imports/svg-w4jnqeqhpf"`.

### 5. App shell — `src/App.tsx`

Replace the empty `App` with a state-based router:

```tsx
type Screen = 'inicio' | 'mapa' | 'nova' | 'atividade' | 'perfil' | 'detalhe';

export default function App() {
  const [screen, setScreen] = useState<Screen>('inicio');
  // render active screen, pass navigation callbacks
}
```

The app renders a mobile-sized container (`max-w-[390px] mx-auto h-full`) to match the 390px Figma frame width. Each screen fills full height and manages its own scrollable content area between a fixed header and fixed nav bar.

### 6. Scrollable content

Each screen's middle content area gets `overflow-y-auto` so it can scroll independently without the header or nav bar scrolling away.

---

## Files to create/modify

- `src/index.css` — add font imports and `@font-face` declarations
- `src/App.tsx` — state-based navigation shell
- `src/components/Navegacao.tsx` — shared nav bar with active state
- `src/components/Cabecalho.tsx` — shared header
- `src/screens/Inicio.tsx`
- `src/screens/Mapa.tsx`
- `src/screens/NovaOcorrencia.tsx`
- `src/screens/Atividade.tsx`
- `src/screens/Perfil.tsx`
- `src/screens/Detalhe.tsx`

## Verification

Navigate between all 5 tabs in the preview. Confirm:
- Tab switching works (active tab highlighted in nav)
- Clicking an occurrence card on Início opens the Detalhe screen
- The "＋" button opens Nova Ocorrência
- Content scrolls within each screen without moving the header or nav bar
- Map image renders on the Mapa screen
- Fonts render correctly (Inter Bold, Regular, SemiBold)
