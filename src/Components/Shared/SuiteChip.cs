using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a hero colour chip.</summary>
public sealed class SuiteChipProps
{
    /// <summary>Gets the product to display.</summary>
    public Product Product { get; init; } = new();

    /// <summary>Gets the zero-based position.</summary>
    public int Index { get; init; }

    /// <summary>Gets whether the dot pattern is visible.</summary>
    public bool Dots { get; init; }
}

/// <summary>A product tile inside the hero artwork.</summary>
public sealed class SuiteChip : Component<SuiteChipProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var product = Props.Product;
        var attributes = new Dictionary<string, string>
        {
            ["style"] = $"--chip:{product.Accent}"
        };

        if (Props.Dots)
        {
            attributes["data-pat"] = "dots";
        }

        return Div(new() { ClassName = "chip", Attributes = attributes },
            Span(new() { ClassName = "chip__top" },
                Span(new(), Text(SiteUi.Pad(Props.Index + 1))),
                Span(new(), Text(product.Category.Split(' ')[0]))),
            Span(new()
            {
                ClassName = "chip__glyph",
                Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
            }, SiteUi.ProductGlyph(product)),
            Span(new() { ClassName = "chip__name" }, Text(product.Name)));
    }
}
