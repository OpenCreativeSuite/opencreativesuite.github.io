using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>The receipt-styled statement of the suite's price.</summary>
public sealed class Receipt : Component
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var products = SiteContent.Data.Products;
        var year = DateTime.UtcNow.Year;

        return Div(new() { ClassName = "receipt-wrap reveal" },
            Div(new() { ClassName = "receipt" },
                Div(new() { ClassName = "receipt__head" },
                    Strong(new(), Text("Open Creative Suite")),
                    Span(new(), Text($"Receipt no. 000-000 · {year}"))),
                Ul(new() { ClassName = "receipt__lines" },
                    Each(products, product => Line(product.Name)),
                    Li(new() { ClassName = "receipt__rule" },
                        Span(new(), Text("Subscription fee")),
                        Span(new() { ClassName = "receipt__lead" }),
                        Span(new(), Text("$0"))),
                    Line("Seat licences"),
                    Line("Export watermarks")),
                Div(new() { ClassName = "receipt__total" },
                    Span(new(), Text("Total due")),
                    B(new(), Text("$0.00"))),
                Div(new() { ClassName = "receipt__stamp" }, Text("PAID IN FULL · FOREVER")),
                Div(new()
                {
                    ClassName = "receipt__barcode",
                    Attributes = new Dictionary<string, string> { ["aria-hidden"] = "true" }
                }),
                Div(new() { ClassName = "receipt__foot" },
                    Span(new(), Text("THANK YOU FOR MAKING THINGS")),
                    Span(new(), Text("NO REFUNDS NEEDED")))));
    }

    private static Node Line(string label) =>
        Li(new(),
            Span(new(), Text(label)),
            Span(new() { ClassName = "receipt__lead" }),
            Span(new(), Text("$0")));
}
