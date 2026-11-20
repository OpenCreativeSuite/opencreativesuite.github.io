using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the small uppercase section label.</summary>
public sealed class EyebrowProps
{
    /// <summary>Gets the label text.</summary>
    public string Text { get; init; } = "";

    /// <summary>Gets an optional modifier class.</summary>
    public string? ExtraClass { get; init; }

    /// <summary>Gets optional inline styles.</summary>
    public string? Style { get; init; }
}

/// <summary>The dot-and-mono label that sits above headings.</summary>
public sealed class Eyebrow : Component<EyebrowProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var className = string.IsNullOrWhiteSpace(Props.ExtraClass)
            ? "eyebrow"
            : "eyebrow " + Props.ExtraClass;

        return P(new()
        {
            ClassName = className,
            Attributes = Props.Style is null
                ? null
                : new Dictionary<string, string> { ["style"] = Props.Style }
        }, Text(Props.Text));
    }
}
