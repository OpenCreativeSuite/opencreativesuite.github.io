using Donkeh.UILab;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the primary download button.</summary>
public sealed class DownloadButtonProps
{
    /// <summary>Gets the product to download.</summary>
    public Product Product { get; init; } = new();
}

/// <summary>
/// Downloads the latest release. The label follows the visitor's platform when
/// it can be detected, and the link follows the newest release when GitHub is
/// reachable.
/// </summary>
public sealed class DownloadButton : Component<DownloadButtonProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var (label, setLabel) = State("Download latest");
        var (url, setUrl) = State(Props.Product.ReleaseUrl);

        Effect(() =>
        {
            var task = LoadAsync();
        }, []);

        return A(new()
        {
            ClassName = "btn btn--accent",
            Href = url,
            Target = "_blank",
            Rel = "noopener"
        },
            SiteUi.Icon("download"),
            Span(new(), Text(label)));

        async Task LoadAsync()
        {
            var platform = await SiteInterop.DetectPlatformAsync();

            if (!string.IsNullOrWhiteSpace(platform))
            {
                setLabel("Download for " + platform);
            }

            var release = await ReleaseCache.GetAsync(Props.Product.Repo);

            if (release is { Url.Length: > 0 })
            {
                setUrl(release.Url);
            }
        }
    }
}
