using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Pages;

/// <summary>The home page: hero, suite cards, manifesto, source and CTA.</summary>
public sealed class HomePage : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var data = SiteContent.Data;
        var site = data.Site;
        var products = data.Products;
        var count = products.Count;
        var chipHeight = count <= 2 ? 250 : count <= 4 ? 148 : 112;
        var glyphSize = count <= 2 ? 74 : 50;
        var nameSize = count <= 2 ? 22 : 16;

        Effect(() =>
        {
            var task = SiteInterop.SetPageMetaAsync(
                $"{site.Name}: professional creative tools, free forever",
                site.Description,
                "/");
        }, []);

        return F(
            Section(new() { ClassName = "hero" },
                Div(new() { ClassName = "wrap hero__grid" },
                    Div(new(),
                        SiteUi.Eyebrow($"Open Creative Suite / est. {site.Founded}", "hero__eyebrow"),
                        H1(new(),
                            Span(new() { ClassName = "line" }, Text("Pro-grade.")),
                            Span(new() { ClassName = "line" },
                                Span(new() { ClassName = "mark" }, Text("Zero")),
                                Text(" "),
                                Span(new() { ClassName = "scribble" },
                                    Text("bills."),
                                    SiteUi.Scribble()))),
                        P(new() { ClassName = "hero__sub" },
                            Text($"{SiteUi.CountWord(count)} serious creative {(count == 1 ? "tool" : "tools")} for {SiteUi.CategoryList()}. No subscriptions, no seat limits, no watermarks. Download once. Own it forever.")),
                        Div(new() { ClassName = "btn-row" },
                            A(new() { ClassName = "btn btn--lime", Href = "#suite" },
                                Text("Browse the suite"),
                                SiteUi.Icon("arrow")),
                            A(new()
                                {
                                    ClassName = "btn btn--outline",
                                    Href = site.Github,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                SiteUi.Icon("github"),
                                Text("Star on GitHub"))),
                        Ul(new() { ClassName = "hero__meta" },
                            Li(new(), Text("Source-available")),
                            Li(new(), Text("Windows · macOS · Linux")),
                            Li(new(), Text("No account required")))),
                    Div(new()
                    {
                        ClassName = "hero-art",
                        Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                    },
                        Div(new() { ClassName = "hero-art__panel" },
                            Div(new() { ClassName = "hero-art__pattern" }),
                            Div(new()
                            {
                                ClassName = "chips",
                                Attributes = new Dictionary<string, string>
                                {
                                    ["style"] = $"--chip-h:{chipHeight}px;--glyph-w:{glyphSize}px;--name-size:{nameSize}px"
                                }
                            },
                                Each(products.Select((product, index) => (product, index)),
                                    item => C<SuiteChip, SuiteChipProps>(new SuiteChipProps
                                    {
                                        Product = item.product,
                                        Index = item.index,
                                        Dots = item.index % 3 == 0
                                    })),
                                F(Show(count < 6, Div(new() { ClassName = "chip chip--more" },
                                    Span(new(), Text("More tools in the works")),
                                    Span(new()
                                    {
                                        Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                                    }, Text("+")))))),
                            Div(new() { ClassName = "hero-art__foot" },
                                Span(new(), Text($"{count} apps · one suite")),
                                Span(new(), Text("$0.00")))),
                        Div(new() { ClassName = "sticker" },
                            Text("100% Free"),
                            Small(new(), Text("Forever · no catch"))),
                        Div(new() { ClassName = "sticker sticker--tag" }, Text("No trials"))))),

            SiteUi.Ticker(
            [
                "No subscriptions",
                "No seat limits",
                "No watermarks",
                "No telemetry",
                "No lock-in",
                "Your files stay yours"
            ]),

            Section(new()
            {
                ClassName = "section",
                Id = "suite",
                Attributes = new Dictionary<string, string> { ["data-section"] = "suite" }
            },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        "01 / The suite",
                        $"{SiteUi.CountWord(count)} {(count == 1 ? "tool" : "tools")}.<br>No invoice.",
                        $"{SiteUi.Cap(SiteUi.CategoryList())}{(count < 6 ? ", with more on the way" : "")}. One shared design language, one honest price, every tool included."),
                    Div(new() { ClassName = "apps-grid" },
                        Each(products.Select((product, index) => (product, index)),
                            item => C<AppCard, AppCardProps>(new AppCardProps
                            {
                                Product = item.product,
                                Index = item.index
                            }))))),

            Section(new()
            {
                ClassName = "section section--dark",
                Id = "why",
                Attributes = new Dictionary<string, string> { ["data-section"] = "why" }
            },
                Div(new() { ClassName = "wrap split" },
                    Div(new() { ClassName = "reveal" },
                        SiteUi.Eyebrow("02 / The deal", null, "margin-bottom:18px"),
                        H2(new()
                        {
                            Attributes = new Dictionary<string, string>
                            {
                                ["style"] = "font-size:clamp(38px,4.8vw,64px);text-transform:uppercase;line-height:.92;margin-bottom:20px"
                            }
                        }, Text("We're not renting"), H("br"), Text("you software.")),
                        P(new()
                        {
                            ClassName = "lede",
                            Attributes = new Dictionary<string, string> { ["style"] = "margin-bottom:10px" }
                        }, Text("The creative industry runs on subscriptions that expire the moment you stop paying. We think that's a strange way to treat the things you make.")),
                        Div(new() { ClassName = "principles" },
                            C<Principle, PrincipleProps>(new PrincipleProps
                            {
                                Index = 0,
                                Title = "Free is the feature",
                                Body = "No trials, no tiers, no “pro” upsell hiding the export button. Every tool is fully featured on day one, because the work is the point."
                            }),
                            C<Principle, PrincipleProps>(new PrincipleProps
                            {
                                Index = 1,
                                Title = "Your files are yours",
                                Body = "Open formats, documented specs and no cloud requirement. Export everything, take it anywhere, open it in ten years."
                            }),
                            C<Principle, PrincipleProps>(new PrincipleProps
                            {
                                Index = 2,
                                Title = "Source in the open",
                                Body = "Apache 2.0 with the Commons Clause. Read the code, audit it, fork it for yourself, but don't resell it. The roadmap lives in public."
                            }),
                            C<Principle, PrincipleProps>(new PrincipleProps
                            {
                                Index = 3,
                                Title = "No account. No telemetry.",
                                Body = "Download and work offline. We don't know who you are, what you're making, or how many machines you're on. We're keeping it that way."
                            }))),
                    C<Receipt>())),

            Section(new()
            {
                ClassName = "section",
                Id = "source",
                Attributes = new Dictionary<string, string> { ["data-section"] = "source" }
            },
                Div(new() { ClassName = "wrap oss-grid" },
                    Div(new() { ClassName = "reveal" },
                        SiteUi.Eyebrow("03 / The source", null, "margin-bottom:18px"),
                        H2(new(), Text("The source"), H("br"), Text("is the spec.")),
                        P(new() { ClassName = "lede" },
                            Text("Every app is built in public. Read it, audit it, fork it for your own use, but don't resell the software. If we ever go strange, the source stays with you.")),
                        Div(new() { ClassName = "license-row" },
                            ChipTag("Apache 2.0 + Commons Clause"),
                            ChipTag("No CLA"),
                            ChipTag("Public roadmap"),
                            ChipTag("Buildable from source")),
                        Div(new() { ClassName = "oss-links" },
                            A(new()
                                {
                                    ClassName = "btn",
                                    Href = site.Github,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                SiteUi.Icon("github"),
                                Text("GitHub")),
                            A(new()
                                {
                                    ClassName = "btn btn--outline",
                                    Href = site.Community,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                Text("Community"),
                                SiteUi.Icon("arrowUpRight")),
                            A(new()
                                {
                                    ClassName = "btn btn--outline",
                                    Href = products.Count > 0 ? products[0].IssuesUrl : site.Github,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                Text("Report a bug"),
                                SiteUi.Icon("arrowUpRight")))),
                    Div(new() { ClassName = "reveal" },
                        C<CodePanel, CodePanelProps>(new CodePanelProps { Products = products })))),

            C<CtaBand, CtaBandProps>(new CtaBandProps
            {
                Title = "Stop renting<br>your tools.",
                Copy = "Pick an app, download the latest release, and get back to work. No email gate, no trial timer, no card.",
                PrimaryLabel = "Choose your app",
                PrimaryHref = "#suite",
                SecondaryLabel = "Read the manifesto",
                SecondaryHref = "/about"
            }));
    }

    private static Node ChipTag(string label) =>
        Span(new() { ClassName = "chip-tag" }, Text(label));
}
