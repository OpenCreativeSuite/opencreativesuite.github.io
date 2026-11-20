using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Layout;

/// <summary>The dark footer, driven by content.json.</summary>
public sealed class SiteFooter : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var data = SiteContent.Data;
        var site = data.Site;
        var products = data.Products;
        var year = DateTime.UtcNow.Year;

        return H("footer", new Props { ClassName = "site-footer" },
            Div(new() { ClassName = "wrap" },
                Div(new() { ClassName = "footer-grid" },
                    Div(new() { ClassName = "footer-brand" },
                        A(new() { ClassName = "brand brand--light", Href = "/" },
                            Span(new()
                            {
                                ClassName = "brand__mark",
                                Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                            }, Text("OCS")),
                            Span(new() { ClassName = "brand__txt" },
                                Text("Open Creative Suite"),
                                Small(new(), Text("Free · Source-available")))),
                        P(new(), Text($"Professional creative tools for {SiteUi.CategoryList()}. No subscriptions. No seat limits. No catch.")),
                        Span(new() { ClassName = "footer-badge" }, Text("Source-available · Free forever"))),
                    Div(new() { ClassName = "footer-col" },
                        H2(new(), Text("The suite")),
                        Ul(new(),
                            Each(products, product => Li(new(),
                                A(new() { Href = $"/apps/{product.Slug}/" }, Text(product.Name)))))),
                    Div(new() { ClassName = "footer-col" },
                        H2(new(), Text("Project")),
                        Ul(new(),
                            Li(new(), A(new() { Href = "/about" }, Text("About"))),
                            Li(new(), A(new() { Href = "/about#licensing" }, Text("Licensing"))),
                            Li(new(), A(new() { Href = "/#source" }, Text("Source code"))),
                            Li(new(), ExternalLink(site.Github, "GitHub")),
                            Li(new(), ExternalLink(site.Community, "Community")))),
                    Div(new() { ClassName = "footer-col" },
                        H2(new(), Text("Support")),
                        Ul(new(),
                            Each(products.Take(3), product => Li(new(),
                                ExternalLink(product.IssuesUrl, $"{product.Name} issues"))),
                            Li(new(), A(new() { Href = "/about#faq" }, Text("FAQ"))),
                            Li(new(), A(new() { Href = "/#source" }, Text("Contributing")))))),
                Div(new()
                {
                    ClassName = "footer-wordmark",
                    Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                }, Text("Open Creative Suite")),
                Div(new() { ClassName = "footer-bottom" },
                    Span(new(), Text($"© {year} {site.Name}")),
                    Span(new(), Text("Made by people who got tired of subscriptions.")),
                    Span(new()
                    {
                        ClassName = "footer-swatches",
                        Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                    },
                        Each(products, product => H("i", new Props
                        {
                            Attributes = new Dictionary<string, string>
                            {
                                ["style"] = $"--sw:{product.Accent}"
                            }
                        }))),
                    A(new() { Href = "#top" }, Text("Back to top ↑")))));
    }

    private static Node ExternalLink(string href, string label) =>
        A(new() { Href = href, Target = "_blank", Rel = "noopener" },
            Text(label + " "),
            Span(new() { ClassName = "ext" }, Text("↗")));
}
