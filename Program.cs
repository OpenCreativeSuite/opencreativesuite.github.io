using Donkeh.Hosting;
using Donkeh.UILab;
using Donkeh.Windowing.Browser;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.JSInterop;
using OpenCreativeSuite.Components.Layout;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab.Routing;
using static Donkeh.UILab._;

[assembly: Donkeh.UILab.Stylesheet("assets/css/site.css")]
[assembly: Donkeh.UILab.Stylesheet("src/Styles/app-shell.css")]

namespace OpenCreativeSuite;

/// <summary>
/// The marketing site, mounted as a Donkeh WebAssembly application.
/// </summary>
[AppRoot(
    Width = 1280,
    Height = 900,
    Title = "Open Creative Suite: professional creative tools, free forever",
    ClearColor = 0xFFF3F0E6)]
public sealed class App : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var site = SiteContent.Data.Site;

        return Div(new()
        {
            Id = "top",
            ClassName = "app-root",
            Attributes = new Dictionary<string, string>
            {
                ["data-site"] = site.ShortName
            }
        },
            AppRouter(SiteInterop.InitialPath, C<SiteShell>()));
    }
}

/// <summary>Browser entry point used by the WebAssembly host.</summary>
public static class Program
{
    /// <summary>Starts Blazor, the browser bridge and the Donkeh host.</summary>
    /// <param name="args">Host arguments supplied by the browser.</param>
    /// <returns>A task that completes when the host stops.</returns>
    public static async Task Main(string[] args)
    {
        var builder = WebAssemblyHostBuilder.CreateDefault(args);
        builder.Services.AddSingleton<DomHost>();

        var host = builder.Build();
        var js = host.Services.GetRequiredService<IJSRuntime>();

        // Site interop is installed before the first render so SVG elements get
        // the correct namespace and the initial location can be read.
        await SiteInterop.InitializeAsync(js);

        await host.Services.GetRequiredService<DomHost>().StartAsync();
        await host.RunAsync();
    }
}
