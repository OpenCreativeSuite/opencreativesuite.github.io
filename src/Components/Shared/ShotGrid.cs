using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a gallery of product screenshots.</summary>
public sealed class ShotGridProps
{
    /// <summary>Gets the product that owns the screenshots.</summary>
    public Product Product { get; init; } = new();

    /// <summary>Gets the shot captions.</summary>
    public IReadOnlyList<Shot> Shots { get; init; } = [];

    /// <summary>Gets the image files that correspond to the shots.</summary>
    public IReadOnlyList<ImageAsset> Images { get; init; } = [];

    /// <summary>Gets whether the grid is a two-column pair.</summary>
    public bool Pair { get; init; }
}

/// <summary>A screenshot figure grid.</summary>
public sealed class ShotGrid : Component<ShotGridProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var className = Props.Pair ? "shots-grid shots-grid--pair" : "shots-grid";

        return Div(new() { ClassName = className },
            Each(
                Props.Shots.Select((shot, index) => (shot, index)),
                item =>
                {
                    var image = item.index < Props.Images.Count ? Props.Images[item.index] : null;

                    if (image is null)
                    {
                        return null;
                    }

                    return Figure(new() { ClassName = "shot reveal" },
                        Div(new() { ClassName = "shot__frame" },
                            Img(new()
                            {
                                ClassName = "app-shot",
                                Src = $"/assets/img/apps/{Props.Product.Slug}/{image.File}",
                                Alt = string.IsNullOrWhiteSpace(image.Alt)
                                    ? $"{Props.Product.Name}: {item.shot.Label}"
                                    : image.Alt,
                                Attributes = new Dictionary<string, string>
                                {
                                    ["width"] = Props.Product.ShotWidth.ToString(),
                                    ["height"] = Props.Product.ShotHeight.ToString(),
                                    ["loading"] = "lazy",
                                    ["decoding"] = "async"
                                }
                            })),
                        Figcaption(new() { ClassName = "shot__cap" },
                            Span(new() { ClassName = "shot__label" }, Text(item.shot.Label)),
                            P(new(), Text(item.shot.Caption))));
                }));
    }
}
