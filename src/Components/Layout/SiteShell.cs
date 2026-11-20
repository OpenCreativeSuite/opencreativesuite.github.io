using Donkeh.UILab;
using OpenCreativeSuite.Components.Pages;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab.Routing;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Layout;

/// <summary>
/// Shared page chrome and the route table. It lives under the framework's
/// <see cref="AppRouter"/> so the header and footer can read the current path.
/// </summary>
public sealed class SiteShell : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var path = UseContext(Router.Path);
        var product = FindProduct(path);

        return Div(new()
        {
            ClassName = product is null ? "site-shell" : "site-shell app-page",
            Attributes = product is null
                ? null
                : new Dictionary<string, string>
                {
                    ["style"] = $"--accent:{product.Accent};--accent-soft:{product.AccentSoft}"
                }
        },
            C<SiteHeader>(),
            Main(new() { Id = "main" },
                C<AppRoutes, AppRoutesProps>(new AppRoutesProps
                {
                    Children =
                    [
                        Route("/", () => C<HomePage>()),
                        Route("/about", () => C<AboutPage>()),
                        Route("/apps/*", () => C<ProductRoute>())
                    ],
                    Fallback = C<NotFoundPage>()
                })),
            C<SiteFooter>());
    }

    private static Product? FindProduct(string path)
    {
        const string prefix = "/apps/";

        if (!path.StartsWith(prefix, StringComparison.Ordinal))
        {
            return null;
        }

        return SiteContent.Data.Product(path[prefix.Length..]);
    }
}
