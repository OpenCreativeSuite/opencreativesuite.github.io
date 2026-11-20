using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the standard section heading block.</summary>
public sealed class SectionHeadProps
{
    /// <summary>Gets the small numbered label above the title.</summary>
    public string Eyebrow { get; init; } = "";

    /// <summary>Gets the title. A literal <c>&lt;br&gt;</c> starts a new line.</summary>
    public string Title { get; init; } = "";

    /// <summary>Gets the supporting paragraph. An empty value omits it.</summary>
    public string Lede { get; init; } = "";

    /// <summary>Gets an optional modifier class for the block.</summary>
    public string? ExtraClass { get; init; }
}

/// <summary>The eyebrow, two-line title and lede used by most sections.</summary>
public sealed class SectionHead : Component<SectionHeadProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var className = string.IsNullOrWhiteSpace(Props.ExtraClass)
            ? "sec-head"
            : "sec-head " + Props.ExtraClass;

        return Div(new() { ClassName = className },
            SiteUi.Eyebrow(Props.Eyebrow, "sec-head__eyebrow"),
            H2(new(), SiteUi.Lines(Props.Title)),
            F(Show(!string.IsNullOrWhiteSpace(Props.Lede),
                P(new() { ClassName = "lede" }, Text(Props.Lede)))));
    }
}
