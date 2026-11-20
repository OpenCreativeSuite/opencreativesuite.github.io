using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the scrolling manifesto ticker.</summary>
public sealed class TickerProps
{
    /// <summary>Gets the phrases shown in sequence.</summary>
    public IReadOnlyList<string> Items { get; init; } = [];

    /// <summary>Gets the ticker class, including any colour modifier.</summary>
    public string ClassName { get; init; } = "ticker";
}

/// <summary>The infinite horizontal ticker used under heroes and section heads.</summary>
public sealed class Ticker : Component<TickerProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var items = Props.Items.ToArray();

        return Div(new()
        {
            ClassName = Props.ClassName,
            Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
        },
            Div(new() { ClassName = "ticker__track" },
                Sequence(items),
                Sequence(items)));
    }

    private static Node Sequence(string[] items)
    {
        var nodes = new List<Node?>(items.Length * 2);

        foreach (var item in items)
        {
            nodes.Add(Span(new(), Text(item)));
            nodes.Add(H("b", null, Text("✳")));
        }

        return Div(new() { ClassName = "ticker__seq" }, F([.. nodes]));
    }
}
