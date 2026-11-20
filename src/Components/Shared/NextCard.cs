using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a compact next/previous product card.</summary>
public sealed class NextCardProps
{
    /// <summary>Gets the product to display.</summary>
    public Product Product { get; init; } = new();

    /// <summary>Gets the label, such as "Next" or a category.</summary>
    public string Label { get; init; } = "Next";

    /// <summary>Gets the arrow glyph text.</summary>
    public string Arrow { get; init; } = "→";

    /// <summary>Gets whether the arrow is repeated in the small label.</summary>
    public bool ArrowInLabel { get; init; } = true;
}

/// <summary>A small product link used below product pages and in the about page.</summary>
public sealed class NextCard : Component<NextCardProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var product = Props.Product;

        return A(new()
        {
            ClassName = "next-card",
            Href = $"/apps/{product.Slug}/",
            Attributes = new Dictionary<string, string>
            {
                ["style"] = $"--next-accent:{product.Accent}"
            }
        },
            Span(new()
            {
                ClassName = "next-card__tile",
                Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
            }, SiteUi.ProductGlyph(product)),
            Span(new(),
                Small(new(), Text(Props.ArrowInLabel ? $"{Props.Arrow} {Props.Label}" : Props.Label)),
                Strong(new(), Text(product.Name))),
            Span(new()
            {
                ClassName = "next-card__arrow",
                Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
            }, Text(Props.Arrow)));
    }
}
