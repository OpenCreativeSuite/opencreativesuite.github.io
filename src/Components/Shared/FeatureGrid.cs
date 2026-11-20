using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a feature grid.</summary>
public sealed class FeatureGridProps
{
    /// <summary>Gets the features to list.</summary>
    public IReadOnlyList<Feature> Features { get; init; } = [];

    /// <summary>Gets the section number shown before the slash.</summary>
    public int SectionNumber { get; init; } = 1;
}

/// <summary>The bordered feature list used on product pages.</summary>
public sealed class FeatureGrid : Component<FeatureGridProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var count = Props.Features.Count;

        return Div(new() { ClassName = "features" },
            Each(
                Props.Features.Select((feature, index) => (feature, index)),
                item => Div(new() { ClassName = "feature reveal" },
                    Span(new() { ClassName = "feature__num" },
                        H("b", null, Text(SiteUi.Pad(item.index + 1))),
                        Text($" / {SiteUi.Pad(count)}")),
                    H3(new(), Text(item.feature.Title)),
                    P(new(), Text(item.feature.Body)))));
    }
}
