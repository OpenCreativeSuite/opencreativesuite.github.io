using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for an application card in the suite grid.</summary>
public sealed class AppCardProps
{
    /// <summary>Gets the product to display.</summary>
    public Product Product { get; init; } = new();

    /// <summary>Gets the zero-based position in the suite.</summary>
    public int Index { get; init; }
}

/// <summary>One product card on the home page.</summary>
public sealed class AppCard : Component<AppCardProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var product = Props.Product;

        return Article(new()
        {
            ClassName = "app-card reveal",
            Attributes = new Dictionary<string, string>
            {
                ["style"] = $"--accent:{product.Accent};--accent-soft:{product.AccentSoft}"
            }
        },
            A(new() { ClassName = "app-card__link", Href = $"/apps/{product.Slug}/" },
                Span(new()
                {
                    ClassName = "app-card__spine",
                    Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                }),
                Span(new()
                {
                    ClassName = "app-card__stage",
                    Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                },
                    Span(new() { ClassName = "app-card__index" }, Text(SiteUi.Pad(Props.Index + 1))),
                    Span(new() { ClassName = "app-card__cat" }, Text(product.Category)),
                    Span(new() { ClassName = "app-card__glyph" }, SiteUi.ProductGlyph(product))),
                Span(new() { ClassName = "app-card__body" },
                    H3(new(),
                        Text(product.Name),
                        Span(new(), Text("Open →"))),
                    P(new(), Text(product.Tagline)),
                    Span(new() { ClassName = "app-card__foot" },
                        Span(new(), Text(string.Join(" / ", product.Platforms))),
                        H("b", null, Text("v" + product.Version))))));
    }
}
