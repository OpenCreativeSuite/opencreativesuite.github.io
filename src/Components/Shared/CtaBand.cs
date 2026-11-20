using Donkeh.UILab;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the lime call-to-action band.</summary>
public sealed class CtaBandProps
{
    /// <summary>Gets the two-line heading.</summary>
    public string Title { get; init; } = "";

    /// <summary>Gets the supporting copy.</summary>
    public string Copy { get; init; } = "";

    /// <summary>Gets the primary button label.</summary>
    public string PrimaryLabel { get; init; } = "Browse the suite";

    /// <summary>Gets the primary button URL.</summary>
    public string PrimaryHref { get; init; } = "/#suite";

    /// <summary>Gets the secondary button label.</summary>
    public string SecondaryLabel { get; init; } = "Read the manifesto";

    /// <summary>Gets the secondary button URL.</summary>
    public string SecondaryHref { get; init; } = "/about";
}

/// <summary>The full-width lime call to action.</summary>
public sealed class CtaBand : Component<CtaBandProps>
{
    /// <inheritdoc/>
    public override Node Render() =>
        Section(new() { ClassName = "cta-band" },
            Div(new() { ClassName = "wrap cta-band__in" },
                H2(new(), SiteUi.Lines(Props.Title)),
                Div(new(),
                    P(new(), Text(Props.Copy)),
                    Div(new() { ClassName = "cta-band__actions" },
                        A(new() { ClassName = "btn", Href = Props.PrimaryHref },
                            Text(Props.PrimaryLabel),
                            SiteUi.Icon("arrow")),
                        A(new() { ClassName = "btn btn--outline", Href = Props.SecondaryHref },
                            Text(Props.SecondaryLabel))))));
}
