using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Pages;

/// <summary>Props for a product page.</summary>
public sealed class ProductPageProps
{
    /// <summary>Gets the product slug from content.json.</summary>
    public string Slug { get; init; } = "";
}

/// <summary>A full product page: hero, features, screenshots, detail sections and download.</summary>
public sealed class ProductPage : Component<ProductPageProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var data = SiteContent.Data;
        var site = data.Site;
        var product = data.Product(Props.Slug);

        if (product is null)
        {
            return C<NotFoundPage>();
        }

        Effect(() =>
        {
            var task = SiteInterop.SetPageMetaAsync(
                $"{product.Name} | {product.Category} | {site.Name}",
                $"{product.Tagline} {product.Blurb} Free forever, source-available, no account required.",
                $"/apps/{product.Slug}");
        }, []);

        var index = data.Products.IndexOf(product);
        var previous = data.Products[(index - 1 + data.Products.Count) % data.Products.Count];
        var next = data.Products[(index + 1) % data.Products.Count];
        var titleLines = product.TitleLines.Count > 0 ? product.TitleLines : [product.Name];
        var titleLength = titleLines.Max(line => line.Length);
        var specsNumber = SiteUi.Pad(3 + product.DetailSections.Count);

        return F(
            Div(new() { ClassName = "wrap" },
                Nav(new()
                {
                    ClassName = "breadcrumb",
                    Attributes = new Dictionary<string, string> { ["aria-label"] = "Breadcrumb" }
                },
                    A(new() { Href = "/" }, Text("Suite")),
                    Span(new(), Text("/")),
                    H("b", null, Text(product.Name)))),

            Section(new() { ClassName = "app-hero" },
                Div(new() { ClassName = "wrap app-hero__grid" },
                    Div(new() { ClassName = "app-hero__copy" },
                        Div(new() { ClassName = "app-hero__eyebrow" },
                            SiteUi.Eyebrow(product.Category),
                            Span(new() { ClassName = "version-pill" },
                                Text("v"),
                                C<ReleaseVersion, ReleaseVersionProps>(new ReleaseVersionProps
                                {
                                    Product = product,
                                    Prefix = ""
                                })),
                            Span(new() { ClassName = "free-pill" }, Text("$0 · Free forever"))),
                        H1(new()
                        {
                            Attributes = new Dictionary<string, string>
                            {
                                ["style"] = $"--len:{titleLength}"
                            }
                        },
                            Each(titleLines.Select((line, lineIndex) => (line, lineIndex)),
                                item => Span(new()
                                {
                                    ClassName = item.lineIndex > 0
                                        ? "title-line title-line--outline"
                                        : "title-line"
                                }, Text(item.line)))),
                        P(new() { ClassName = "app-hero__tagline" }, Text(product.Tagline)),
                        P(new() { ClassName = "app-hero__blurb" }, Text(product.Blurb)),
                        Div(new() { ClassName = "app-hero__actions btn-row" },
                            C<DownloadButton, DownloadButtonProps>(new DownloadButtonProps { Product = product }),
                            A(new()
                                {
                                    ClassName = "btn btn--outline",
                                    Href = product.RepoUrl,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                SiteUi.Icon("github"),
                                Text("View source"))),
                        Ul(new() { ClassName = "app-hero__meta" },
                            Li(new(),
                                Text("v"),
                                C<ReleaseVersion, ReleaseVersionProps>(new ReleaseVersionProps
                                {
                                    Product = product,
                                    Prefix = ""
                                })),
                            Li(new(), Text(product.LicenseShort)),
                            Li(new(), Text(product.Size)),
                            Li(new(), Text(string.Join(" · ", product.Platforms)))),
                        F(Show(!string.IsNullOrWhiteSpace(product.Docs),
                            P(new() { ClassName = "app-hero__docs" },
                                A(new()
                                    {
                                        ClassName = "text-link",
                                        Href = product.Docs,
                                        Target = "_blank",
                                        Rel = "noopener"
                                    },
                                    Text("Read the user guide"),
                                    SiteUi.Icon("arrowUpRight")),
                                A(new()
                                    {
                                        ClassName = "text-link",
                                        Href = product.IssuesUrl,
                                        Target = "_blank",
                                        Rel = "noopener"
                                    },
                                    Text("Report an issue"),
                                    SiteUi.Icon("arrowUpRight")))))),
                    Div(new() { ClassName = "mock-frame" },
                        HeroVisual(product),
                        Div(new() { ClassName = "mock-frame__label" },
                            Span(new(), Text($"{product.Name} {product.Version} / workspace")),
                            Span(new(), Text("Free · Source-available")))))),

            SiteUi.Ticker(
            [
                $"{product.Name} v{product.Version}",
                "Free forever",
                product.LicenseShort,
                "No account",
                "Windows / macOS / Linux",
                "Latest build from GitHub"
            ], "ticker ticker--accent"),

            Section(new() { ClassName = "section" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        $"01 / Inside {product.Name}",
                        "What you<br>get.",
                        "Every feature ships in the free build. No pro tier, no unlock key, no “contact sales” for the thing you actually need."),
                    C<FeatureGrid, FeatureGridProps>(new FeatureGridProps
                    {
                        Features = product.Features,
                        SectionNumber = 1
                    }))),

            Section(new() { ClassName = "section section--paper2" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        "02 / A look inside",
                        "The workspace.",
                        "Fast, quiet and built around the work. Dark interface, honest controls, and a canvas that gets out of the way."),
                    C<ShotGrid, ShotGridProps>(new ShotGridProps
                    {
                        Product = product,
                        Shots = product.Shots,
                        Images = product.Images?.Shots ?? []
                    }))),

            Each(
                product.DetailSections.Select((section, sectionIndex) => (section, sectionIndex)),
                item => RenderDetailSection(product, item.section, item.sectionIndex)),

            Section(new() { ClassName = "section section--tight" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        $"{specsNumber} / The fine print",
                        "Specs.",
                        "No surprises in the small type. Here is exactly what you are downloading."),
                    C<Specs, SpecsProps>(new SpecsProps { Product = product }))),

            Section(new()
            {
                ClassName = "section",
                Id = "download"
            },
                Div(new() { ClassName = "wrap" },
                    Div(new() { ClassName = "get-panel" },
                        Div(new() { ClassName = "get-panel__in" },
                            SiteUi.Eyebrow("Free forever"),
                            H2(new(), Text("Get "), H("span", null, Text(product.Name)), Text(".")),
                            P(new(), Text("Download the latest release straight from GitHub. No account, no email, no trial timer. Just the app and the source.")),
                            Div(new() { ClassName = "get-panel__actions" },
                                C<PlatformButtons, PlatformButtonsProps>(new PlatformButtonsProps { Product = product }),
                                A(new()
                                    {
                                        ClassName = "btn btn--ghost-dark",
                                        Href = product.RepoUrl,
                                        Target = "_blank",
                                        Rel = "noopener"
                                    },
                                    SiteUi.Icon("code"),
                                    Text("Build from source"))),
                            P(new() { ClassName = "get-panel__note" },
                                Span(new(),
                                    Text("v"),
                                    C<ReleaseVersion, ReleaseVersionProps>(new ReleaseVersionProps
                                    {
                                        Product = product,
                                        Prefix = ""
                                    })),
                                Span(new(), Text(product.Size)),
                                Span(new(), Text(product.LicenseShort)),
                                Span(new(), Text("Direct from GitHub Releases. No email required.")))),
                        Div(new()
                        {
                            ClassName = "get-panel__glyph",
                            Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                        }, SiteUi.ProductGlyph(product))))),

            Section(new() { ClassName = "section section--tight" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead("Keep exploring", "More suite.", ""),
                    Div(new() { ClassName = "next-grid" },
                        C<NextCard, NextCardProps>(new NextCardProps
                        {
                            Product = previous,
                            Label = "Previous",
                            Arrow = "←"
                        }),
                        C<NextCard, NextCardProps>(new NextCardProps
                        {
                            Product = next,
                            Label = "Next",
                            Arrow = "→"
                        })))));
    }

    private static Node RenderDetailSection(Product product, DetailSection section, int index)
    {
        var className = index % 2 == 1 ? "section section--paper2" : "section";
        var pair = section.Images.Count is 2 or 4;

        return Section(new() { ClassName = className },
            Div(new() { ClassName = "wrap" },
                SiteUi.SectionHead(section.Eyebrow, section.Title, section.Lede),
                C<FeatureGrid, FeatureGridProps>(new FeatureGridProps
                {
                    Features = section.Features,
                    SectionNumber = index + 1
                }),
                C<ShotGrid, ShotGridProps>(new ShotGridProps
                {
                    Product = product,
                    Pair = pair,
                    Images = section.Images,
                    Shots = section.Images.Select(image => new Shot
                    {
                        Label = image.Label,
                        Caption = image.Caption
                    }).ToArray()
                })));
    }

    private static Node HeroVisual(Product product)
    {
        var hero = product.Images?.Hero;

        if (hero is null)
        {
            return Div(new() { ClassName = "app-shot" }, SiteUi.ProductGlyph(product));
        }

        return Img(new()
        {
            ClassName = "app-shot",
            Src = $"/assets/img/apps/{product.Slug}/{hero.File}",
            Alt = string.IsNullOrWhiteSpace(hero.Alt) ? product.Name : hero.Alt,
            Attributes = new Dictionary<string, string>
            {
                ["width"] = product.ShotWidth.ToString(),
                ["height"] = product.ShotHeight.ToString(),
                ["fetchpriority"] = "high",
                ["decoding"] = "async"
            }
        });
    }
}

