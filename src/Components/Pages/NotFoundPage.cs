using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Pages;

/// <summary>The in-app 404 page.</summary>
public sealed class NotFoundPage : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var site = SiteContent.Data.Site;

        Effect(() =>
        {
            var task = SiteInterop.SetPageMetaAsync(
                $"Page not found | {site.Name}",
                "That page could not be found.",
                "/404");
        }, []);

        return Section(new() { ClassName = "notfound" },
            Div(new() { ClassName = "wrap notfound__in" },
                SiteUi.Eyebrow("Error 404 / Nothing on this artboard"),
                H1(new(), Text("404")),
                P(new()
                {
                    ClassName = "lede",
                    Attributes = new Dictionary<string, string> { ["style"] = "max-width:40ch" }
                }, Text("That page has been moved, renamed or never existed. The tools are still where you left them.")),
                Div(new() { ClassName = "btn-row" },
                    A(new() { ClassName = "btn btn--lime", Href = "/" },
                        Text("Back to the suite"),
                        SiteUi.Icon("arrow")),
                    A(new() { ClassName = "btn btn--outline", Href = "/#suite" },
                        Text("Browse apps")))),
            Div(new()
            {
                ClassName = "notfound__bg",
                Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
            }, SiteUi.ProductGlyph("spray")));
    }
}
