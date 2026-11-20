using Donkeh.UILab;
using static Donkeh.UILab.Routing;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Pages;

/// <summary>
/// Resolves <c>/apps/{slug}</c> from the framework router and renders the matching
/// product page. Unknown slugs fall through to the product page's 404 output.
/// </summary>
public sealed class ProductRoute : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var path = UseContext(Router.Path);
        const string prefix = "/apps/";
        var slug = path.StartsWith(prefix, StringComparison.Ordinal)
            ? path[prefix.Length..]
            : "";

        return C<ProductPage, ProductPageProps>(new ProductPageProps { Slug = slug });
    }
}
