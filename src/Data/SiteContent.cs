using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenCreativeSuite.Data;

/// <summary>
/// Reads the site's content.json from the application assembly and exposes it
/// as strongly typed data.
/// </summary>
public static class SiteContent
{
    private static readonly Lazy<SiteData> LazyData = new(Load);

    /// <summary>Gets the shared site data.</summary>
    public static SiteData Data => LazyData.Value;

    private static SiteData Load()
    {
        var assembly = typeof(SiteContent).Assembly;
        const string resourceName = "OpenCreativeSuite.content.json";

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' was not found.");

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        };

        var data = JsonSerializer.Deserialize<SiteData>(stream, options)
            ?? throw new InvalidOperationException("content.json could not be read.");

        return data;
    }
}

/// <summary>The root content document.</summary>
public sealed class SiteData
{
    /// <summary>Gets or sets global site settings.</summary>
    public SiteInfo Site { get; set; } = new();

    /// <summary>Gets or sets the products in display order.</summary>
    public List<Product> Products { get; set; } = [];

    /// <summary>Finds a product by its URL slug.</summary>
    public Product? Product(string slug) =>
        Products.FirstOrDefault(product =>
            string.Equals(product.Slug, slug, StringComparison.OrdinalIgnoreCase));
}

/// <summary>Global site settings from content.json.</summary>
public sealed class SiteInfo
{
    public string Name { get; set; } = "Open Creative Suite";
    public string ShortName { get; set; } = "OCS";
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
    public string Url { get; set; } = "";
    public string Github { get; set; } = "";
    public string Community { get; set; } = "";
    public string License { get; set; } = "";
    public string LicenseShort { get; set; } = "";
    public string LicenseUrl { get; set; } = "";
    public string Founded { get; set; } = "";
}

/// <summary>One application in the suite.</summary>
public sealed class Product
{
    public string Slug { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> TitleLines { get; set; } = [];
    public string Category { get; set; } = "";
    public string ShortCategory { get; set; } = "";
    public string Glyph { get; set; } = "cube";
    public string Mock { get; set; } = "";
    public string Accent { get; set; } = "#CCFF00";
    public string AccentSoft { get; set; } = "#EDFFBE";
    public string Tagline { get; set; } = "";
    public string Blurb { get; set; } = "";
    public string Version { get; set; } = "";
    public string Released { get; set; } = "";
    public string Repo { get; set; } = "";
    public string License { get; set; } = "";
    public string LicenseShort { get; set; } = "";
    public List<string> Platforms { get; set; } = [];
    public List<string> Formats { get; set; } = [];
    public string Size { get; set; } = "";
    public string Filename { get; set; } = "";
    public string Status { get; set; } = "";
    public string Docs { get; set; } = "";
    public int ShotWidth { get; set; } = 1440;
    public int ShotHeight { get; set; } = 900;
    public ProductImages? Images { get; set; }
    public List<Feature> Features { get; set; } = [];
    public List<Shot> Shots { get; set; } = [];
    public List<DetailSection> DetailSections { get; set; } = [];

    [JsonIgnore]
    public string RepoUrl => $"https://github.com/{Repo}";

    [JsonIgnore]
    public string ReleaseUrl => $"{RepoUrl}/releases/latest";

    [JsonIgnore]
    public string LicensePageUrl => $"{RepoUrl}/blob/master/LICENSE.md";

    [JsonIgnore]
    public string IssuesUrl => $"{RepoUrl}/issues";
}

/// <summary>Screenshot set for a product.</summary>
public sealed class ProductImages
{
    public ImageAsset? Hero { get; set; }
    public List<ImageAsset> Shots { get; set; } = [];
}

/// <summary>One image reference.</summary>
public sealed class ImageAsset
{
    public string File { get; set; } = "";
    public string Alt { get; set; } = "";
    public string Label { get; set; } = "";
    public string Caption { get; set; } = "";
}

/// <summary>A short feature entry.</summary>
public sealed class Feature
{
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
}

/// <summary>A gallery shot caption.</summary>
public sealed class Shot
{
    public string Label { get; set; } = "";
    public string Caption { get; set; } = "";
}

/// <summary>A long-form section on a product page.</summary>
public sealed class DetailSection
{
    public string Eyebrow { get; set; } = "";
    public string Title { get; set; } = "";
    public string Lede { get; set; } = "";
    public List<Feature> Features { get; set; } = [];
    public List<ImageAsset> Images { get; set; } = [];
}
