using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the build-from-source code panel.</summary>
public sealed class CodePanelProps
{
    /// <summary>Gets the products to show clone commands for.</summary>
    public IReadOnlyList<Product> Products { get; init; } = [];
}

/// <summary>The dark terminal panel in the source section.</summary>
public sealed class CodePanel : Component<CodePanelProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var products = Props.Products.Take(2).ToArray();
        var plain = BuildPlainText(products);
        var highlighted = BuildHighlighted(products);

        return Div(new() { ClassName = "code-panel" },
            Div(new() { ClassName = "code-panel__bar" },
                Span(new()
                {
                    ClassName = "code-panel__dots",
                    Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                },
                    H("i"), H("i"), H("i")),
                Span(new(), Text("bash / build from source")),
                C<CopyButton, CopyButtonProps>(new CopyButtonProps { Text = plain })),
            Pre(new() { Id = "clone-code" },
                Code(new(), F(highlighted))));
    }

    private static string BuildPlainText(IReadOnlyList<Product> products)
    {
        var lines = new List<string>();

        for (var i = 0; i < products.Count; i++)
        {
            if (i > 0)
            {
                lines.Add(string.Empty);
            }

            lines.Add($"# {(i == 0 ? "clone either app" : "or the other one")}");
            lines.Add($"git clone {products[i].RepoUrl}.git");
            lines.Add($"cd {products[i].Name}");
            lines.Add("dotnet run");
        }

        lines.Add(string.Empty);
        lines.Add("# no account. no licence server.");
        lines.Add("→ requires the .NET 10 SDK");

        return string.Join('\n', lines);
    }

    private static Node?[] BuildHighlighted(IReadOnlyList<Product> products)
    {
        var nodes = new List<Node?>();

        for (var i = 0; i < products.Count; i++)
        {
            if (i > 0)
            {
                nodes.Add(Text("\n\n"));
            }

            nodes.Add(Span(new() { ClassName = "c" }, Text($"# {(i == 0 ? "clone either app" : "or the other one")}")));
            nodes.Add(Text("\n"));
            nodes.Add(Span(new() { ClassName = "k" }, Text("git")));
            nodes.Add(Text($" clone {products[i].RepoUrl}.git\n"));
            nodes.Add(Span(new() { ClassName = "k" }, Text("cd")));
            nodes.Add(Text($" {products[i].Name}\n"));
            nodes.Add(Span(new() { ClassName = "k" }, Text("dotnet")));
            nodes.Add(Text(" run"));
        }

        nodes.Add(Text("\n\n"));
        nodes.Add(Span(new() { ClassName = "c" }, Text("# no account. no licence server.")));
        nodes.Add(Text("\n"));
        nodes.Add(Span(new() { ClassName = "n" }, Text("→")));
        nodes.Add(Text(" requires the .NET 10 SDK"));

        return [.. nodes];
    }
}
