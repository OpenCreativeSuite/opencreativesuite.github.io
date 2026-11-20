using Microsoft.JSInterop;

namespace OpenCreativeSuite.Interop;

/// <summary>
/// Small browser-side conveniences that the Donkeh browser host does not expose:
/// SVG namespace creation, document metadata, clipboard, platform detection and
/// GitHub release lookup.
/// </summary>
public static class SiteInterop
{
    private static IJSObjectReference? _module;

    /// <summary>Gets the path the application was opened at.</summary>
    public static string InitialPath { get; private set; } = "/";

    /// <summary>Loads the site interop module and reads the initial location.</summary>
    public static async Task InitializeAsync(IJSRuntime js)
    {
        _module = await js.InvokeAsync<IJSObjectReference>("import", "./site-interop.js");
        InitialPath = await _module.InvokeAsync<string>("init") ?? "/";
    }

    /// <summary>Updates the document title and sharing metadata.</summary>
    public static Task SetPageMetaAsync(string title, string description, string path) =>
        InvokeVoidAsync("setPageMeta", title, description, path);

    /// <summary>Copies text to the browser clipboard.</summary>
    public static async Task<bool> CopyTextAsync(string text)
    {
        if (_module is null)
        {
            return false;
        }

        return await _module.InvokeAsync<bool>("copyText", text);
    }

    /// <summary>Detects the visitor's desktop platform, or null when unknown.</summary>
    public static async Task<string?> DetectPlatformAsync()
    {
        if (_module is null)
        {
            return null;
        }

        return await _module.InvokeAsync<string?>("detectPlatform");
    }

    /// <summary>Reads the latest GitHub release for a repository.</summary>
    public static async Task<ReleaseInfo?> FetchLatestReleaseAsync(string repo)
    {
        if (_module is null)
        {
            return null;
        }

        return await _module.InvokeAsync<ReleaseInfo?>("fetchLatestRelease", repo);
    }

    /// <summary>Scrolls a section into view once it has been rendered.</summary>
    public static Task ScrollToIdAsync(string id) => InvokeVoidAsync("scrollToId", id);

    /// <summary>Scrolls the window to the top.</summary>
    public static Task ScrollToTopAsync() => InvokeVoidAsync("scrollToTop");

    private static async Task InvokeVoidAsync(string identifier, params object?[] args)
    {
        if (_module is not null)
        {
            await _module.InvokeVoidAsync(identifier, args);
        }
    }
}

/// <summary>The parts of a GitHub release the site displays.</summary>
public sealed class ReleaseInfo
{
    /// <summary>Gets or sets the version without a leading <c>v</c>.</summary>
    public string Version { get; set; } = "";

    /// <summary>Gets or sets the release page URL.</summary>
    public string Url { get; set; } = "";
}
