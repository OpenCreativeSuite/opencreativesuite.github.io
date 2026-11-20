using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for an FAQ entry.</summary>
public sealed class FaqItemProps
{
    /// <summary>Gets the question.</summary>
    public string Question { get; init; } = "";

    /// <summary>Gets the answer.</summary>
    public string Answer { get; init; } = "";
}

/// <summary>A native details/summary FAQ entry.</summary>
public sealed class FaqItem : Component<FaqItemProps>
{
    /// <inheritdoc/>
    public override Node Render() =>
        Details(new(),
            Summary(new(), Text(Props.Question)),
            P(new(), Text(Props.Answer)));
}
