using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for a version label that refreshes from GitHub Releases.</summary>
public sealed class ReleaseVersionProps
{
    /// <summary>Gets the product whose release is shown.</summary>
    public Product Product { get; init; } = new();

    /// <summary>Gets the prefix placed before the version, usually "v".</summary>
    public string Prefix { get; init; } = "v";
}

/// <summary>Shows the latest release version, falling back to the content.json value.</summary>
public sealed class ReleaseVersion : Component<ReleaseVersionProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var (version, setVersion) = State(Props.Product.Version);

        Effect(() =>
        {
            var task = LoadAsync();
        }, []);

        return Text(Props.Prefix + version);

        async Task LoadAsync()
        {
            var release = await ReleaseCache.GetAsync(Props.Product.Repo);

            if (release is { Version.Length: > 0 })
            {
                setVersion(release.Version);
            }
        }
    }
}
