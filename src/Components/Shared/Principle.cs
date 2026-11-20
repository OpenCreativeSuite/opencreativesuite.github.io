using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a numbered manifesto principle.</summary>
public sealed class PrincipleProps
{
    /// <summary>Gets the zero-based position.</summary>
    public int Index { get; init; }

    /// <summary>Gets the heading.</summary>
    public string Title { get; init; } = "";

    /// <summary>Gets the explanatory copy.</summary>
    public string Body { get; init; } = "";
}

/// <summary>A numbered principle row.</summary>
public sealed class Principle : Component<PrincipleProps>
{
    /// <inheritdoc/>
    public override Node Render() =>
        Div(new() { ClassName = "principle" },
            Span(new() { ClassName = "principle__num" }, Text(SiteUi.Pad(Props.Index + 1))),
            Div(new(),
                H3(new(), Text(Props.Title)),
                P(new(), Text(Props.Body))));
}
