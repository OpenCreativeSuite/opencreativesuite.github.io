using Donkeh.UILab;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the per-platform download buttons.</summary>
public sealed class PlatformButtonsProps
{
    /// <summary>Gets the product to download.</summary>
    public Product Product { get; init; } = new();
}

/// <summary>Download buttons for each supported platform, highlighting the visitor's.</summary>
public sealed class PlatformButtons : Component<PlatformButtonsProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var (platform, setPlatform) = State<string?>(() => null);

        Effect(() =>
        {
            var task = DetectAsync();
        }, []);

        return F(
            Each(Props.Product.Platforms, name =>
            {
                var isCurrent = string.Equals(name, platform, StringComparison.OrdinalIgnoreCase);
                var attributes = new Dictionary<string, string>();

                if (isCurrent)
                {
                    attributes["aria-current"] = "true";
                }

                return A(new()
                {
                    ClassName = isCurrent ? "btn btn--on-dark is-current" : "btn btn--on-dark",
                    Href = Props.Product.ReleaseUrl,
                    Target = "_blank",
                    Rel = "noopener",
                    Attributes = attributes.Count == 0 ? null : attributes
                }, Text(name));
            }));

        async Task DetectAsync()
        {
            setPlatform(await SiteInterop.DetectPlatformAsync());
        }
    }
}
