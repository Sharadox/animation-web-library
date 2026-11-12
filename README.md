# @sharadox/animation-web-library

Animations for React websites: content that reveals as it scrolls into view, sentences that light up word by word, counters that count up, and an endless strip you can grab and fling. Each one respects reduced-motion settings.

## Install

```sh
pnpm add @sharadox/animation-web-library
```

## API

| Import          | Export                                                   | What it does                                                                                                                                            |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `…/reveal`      | `<Reveal delay? y? blur? margin? className?>`            | Fades, lifts and unblurs its children the first time they scroll into view (Motion)                                                                     |
| `…/scroll-word` | `<ScrollWords text className? offset? opacity? span?>`   | A paragraph whose words brighten as it scrolls through the viewport                                                                                     |
| `…/in-view`     | `useInView(threshold = 0.35)` → `[reference, inView]`    | True once the element has been visible enough; stays true                                                                                               |
| `…/count-up`    | `useCountUp(target, start, durationMilliseconds = 1600)` | Eases a number from 0 to the target; jumps there with reduced motion                                                                                    |
| `…/marquee`     | `useMarquee({ speed = 40 })` → reference                 | An endless strip (two identical groups side by side) that slides, can be dragged and flung with inertia, and scrolls sideways (trackpad, Shift + wheel) |

```tsx
const [card, seen] = useInView<HTMLDivElement>();
const followers = useCountUp(12480, seen);
```

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
