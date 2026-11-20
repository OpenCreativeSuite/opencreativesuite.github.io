using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the product spec list.</summary>
public sealed class SpecsProps
{
    /// <summary>Gets the product whose specs are shown.</summary>
    public Product Product { get; init; } = new();
}

/// <summary>The fine-print specification grid.</summary>
public sealed class Specs : Component<SpecsProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var product = Props.Product;

        return Dl(new() { ClassName = "specs" },
            Spec("Latest release",
                Text("v" + product.Version),
                Small(new(), Text(product.Released))),
            Spec("Licence",
                A(new() { Href = product.LicensePageUrl, Target = "_blank", Rel = "noopener" },
                    Text(product.License)),
                Small(new(), Text("Source-available · no resale"))),
            Spec("Platforms",
                Text(string.Join(" · ", product.Platforms)),
                Small(new(), Text("Native builds"))),
            Spec("Download",
                Text(product.Size),
                Small(new(), Text("Portable archive · no installer"))),
            Spec("Formats",
                Text(string.Join(" · ", product.Formats)),
                Small(new(), Text("Open formats first"))),
            Spec("Source",
                A(new() { Href = product.RepoUrl, Target = "_blank", Rel = "noopener" },
                    Text(product.Name)),
                Small(new(), Text($"github.com/{product.Repo} · {product.LicenseShort}"))));
    }

    private static Node Spec(string label, Node value, Node? note) =>
        Div(new() { ClassName = "spec" },
            Dt(new(), Text(label)),
            Dd(new(), value, note ?? F()));
}
