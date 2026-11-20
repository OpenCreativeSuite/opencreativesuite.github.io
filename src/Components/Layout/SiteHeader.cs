using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab.Routing;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Layout;

/// <summary>The sticky site header and the full-screen mobile menu.</summary>
public sealed class SiteHeader : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var path = UseContext(Router.Path);
        var (open, setOpen) = State(false);
        var site = SiteContent.Data.Site;
        var products = SiteContent.Data.Products;
        var isHome = path == "/";
        var isAbout = path == "/about";

        return F(
            A(new() { ClassName = "skip", Href = "#main" }, Text("Skip to content")),
            H("header", new Props { ClassName = "site-header" },
                Div(new() { ClassName = "wrap site-header__in" },
                    A(new() { ClassName = "brand", Href = "/" },
                        Span(new()
                        {
                            ClassName = "brand__mark",
                            Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                        }, Text("OCS")),
                        Span(new() { ClassName = "brand__txt" },
                            Text("Open Creative Suite"),
                            Small(new(), Text("Free · Source-available")))),
                    Nav(new()
                    {
                        ClassName = "nav",
                        Attributes = new Dictionary<string, string> { ["aria-label"] = "Primary" }
                    },
                        NavLink("Suite", "/#suite", "suite", isHome),
                        NavLink("Manifesto", "/#why", "why", false),
                        NavLink("About", "/about", null, isAbout),
                        A(new()
                        {
                            ClassName = "nav__link nav__link--ext",
                            Href = site.Github,
                            Target = "_blank",
                            Rel = "noopener"
                        }, Text("GitHub"))),
                    Div(new() { ClassName = "site-header__cta" },
                        A(new() { ClassName = "btn btn--lime", Href = "/#suite" },
                            Text("Get the suite"),
                            SiteUi.Icon("arrowUpRight"))),
                    Button(new()
                    {
                        ClassName = "nav-toggle",
                        Type = "button",
                        OnClick = () => setOpen(!open),
                        Attributes = new Dictionary<string, string>
                        {
                            ["aria-expanded"] = open ? "true" : "false",
                            ["aria-controls"] = "menu"
                        }
                    },
                        Span(new()
                        {
                            ClassName = "nav-toggle__bars",
                            Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                        },
                            Span(new(), Text("")),
                            Span(new(), Text("")),
                            Span(new(), Text(""))),
                        Span(new(), Text(open ? "Close" : "Menu"))))),
            Div(new()
            {
                Id = "menu",
                ClassName = open ? "menu is-open" : "menu",
                OnKeyDown = chord =>
                {
                    if (chord == "Escape")
                    {
                        setOpen(false);
                    }
                }
            },
                Nav(new()
                {
                    ClassName = "menu__nav",
                    Attributes = new Dictionary<string, string> { ["aria-label"] = "Mobile" }
                },
                    MenuLink("01", "Suite", "/#suite", "suite", setOpen),
                    MenuLink("02", "Manifesto", "/#why", "why", setOpen),
                    MenuLink("03", "About", "/about", null, setOpen),
                    A(new()
                    {
                        ClassName = "menu__link menu__link--ext",
                        Href = site.Github,
                        Target = "_blank",
                        Rel = "noopener"
                    },
                        Span(new(), Text("↗")),
                        Text("GitHub"))),
                Div(new() { ClassName = "menu__foot" },
                    Span(new(), Text($"{products.Count} apps · {site.LicenseShort} · $0 forever")),
                    Span(new()
                    {
                        ClassName = "menu__swatches",
                        Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                    },
                        Each(products, product => H("i", new Props
                        {
                            Attributes = new Dictionary<string, string>
                            {
                                ["style"] = $"--sw:{product.Accent}"
                            }
                        }))))));
    }

    private static Node NavLink(string label, string href, string? section, bool active)
    {
        var attributes = new Dictionary<string, string>();

        if (section is not null)
        {
            attributes["data-nav-section"] = section;
        }

        if (active)
        {
            attributes["aria-current"] = "page";
        }

        return A(new()
        {
            ClassName = "nav__link",
            Href = href,
            Attributes = attributes.Count == 0 ? null : attributes
        }, Text(label));
    }

    private static Node MenuLink(string number, string label, string href, string? section, Action<bool> setOpen)
    {
        var attributes = new Dictionary<string, string>();

        if (section is not null)
        {
            attributes["data-nav-section"] = section;
        }

        return A(new()
        {
            ClassName = "menu__link",
            Href = href,
            Attributes = attributes.Count == 0 ? null : attributes,
            OnClick = section is null
                ? null
                : () =>
                {
                    setOpen(false);
                    var task = SiteInterop.ScrollToIdAsync(section);
                }
        },
            Span(new(), Text(number)),
            Text(label));
    }
}
