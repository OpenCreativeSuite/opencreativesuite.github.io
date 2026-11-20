using System.Globalization;
using Donkeh.UILab;
using OpenCreativeSuite.Data;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Small shared builders used across the marketing pages.</summary>
public static class SiteUi
{
    /// <summary>Zero-pads a number for the suite's editorial numbering.</summary>
    public static string Pad(int value) => value.ToString("00", CultureInfo.InvariantCulture);

    /// <summary>Turns a count into the display word used in headings.</summary>
    public static string CountWord(int value) => value switch
    {
        0 => "Zero",
        1 => "One",
        2 => "Two",
        3 => "Three",
        4 => "Four",
        5 => "Five",
        6 => "Six",
        7 => "Seven",
        8 => "Eight",
        9 => "Nine",
        10 => "Ten",
        11 => "Eleven",
        12 => "Twelve",
        _ => value.ToString(CultureInfo.InvariantCulture)
    };

    /// <summary>Joins items in the site's "a, b and c" style.</summary>
    public static string JoinList(IEnumerable<string> items)
    {
        var list = items.Where(item => !string.IsNullOrWhiteSpace(item)).ToArray();

        return list.Length switch
        {
            0 => string.Empty,
            1 => list[0],
            _ => string.Join(", ", list[..^1]) + " and " + list[^1]
        };
    }

    /// <summary>Returns the lowercase list of product categories.</summary>
    public static string CategoryList() =>
        JoinList(SiteContent.Data.Products.Select(product => product.ShortCategory));

    /// <summary>Capitalises the first character.</summary>
    public static string Cap(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToUpperInvariant(value[0]) + value[1..];

    /// <summary>Creates the tiny uppercase label used above headings.</summary>
    public static Node Eyebrow(string text, string? extraClass = null, string? style = null) =>
        C<Eyebrow, EyebrowProps>(new EyebrowProps
        {
            Text = text,
            ExtraClass = extraClass,
            Style = style
        });

    /// <summary>Renders content that may contain the content.json <c>&lt;br&gt;</c> marker.</summary>
    public static Node Lines(string text)
    {
        var parts = text.Split("<br>", StringSplitOptions.None);
        var nodes = new List<Node?>(parts.Length * 2);

        for (var i = 0; i < parts.Length; i++)
        {
            if (i > 0)
            {
                nodes.Add(H("br"));
            }

            nodes.Add(Text(parts[i]));
        }

        return F([.. nodes]);
    }

    /// <summary>Creates a section heading component.</summary>
    public static Node SectionHead(string eyebrow, string title, string lede, string? extraClass = null) =>
        C<SectionHead, SectionHeadProps>(new SectionHeadProps
        {
            Eyebrow = eyebrow,
            Title = title,
            Lede = lede,
            ExtraClass = extraClass
        });

    /// <summary>Creates the scrolling manifesto ticker component.</summary>
    public static Node Ticker(IEnumerable<string> items, string className = "ticker") =>
        C<Ticker, TickerProps>(new TickerProps
        {
            Items = items.ToArray(),
            ClassName = className
        });

    /// <summary>Creates a single-colour interface icon.</summary>
    public static Node Icon(string name, string className = "ico")
    {
        var fill = name is "github" or "star";
        var paths = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["arrow"] = "M3 8h10M9 3l5 5-5 5",
            ["arrowUpRight"] = "M4 12L12 4M5 4h7v7",
            ["download"] = "M8 2v8m0 0l3-3m-3 3L5 7M2 13h12",
            ["code"] = "M5 4L1 8l4 4M11 4l4 4-4 4",
            ["arrowLeft"] = "M13 8H3m5-5L3 8l5 5",
            ["github"] = "M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.44-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.2-3.64-.91-3.64-4.02 0-.89.31-1.62.81-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.4 7.4 0 018 3.96c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.5.57.81 1.3.81 2.19 0 3.12-1.87 3.82-3.65 4.02.29.26.54.75.54 1.52 0 1.09-.01 1.97-.01 2.24 0 .22.15.49.55.4A8.16 8.16 0 0016 8.2C16 3.67 12.42 0 8 0z",
            ["star"] = "M8 1l1.9 4.5 4.6.4-3.5 3 1.1 4.5L8 11l-4.1 2.4 1.1-4.5-3.5-3 4.6-.4z"
        };

        return H("svg", new Props
        {
            ClassName = className,
            Attributes = new Dictionary<string, string>
            {
                ["viewBox"] = "0 0 16 16",
                ["aria-hidden"] = "true",
                ["fill"] = fill ? "currentColor" : "none",
                ["stroke"] = fill ? "none" : "currentColor",
                ["stroke-width"] = "1.7",
                ["stroke-linecap"] = "square"
            }
        }, H("path", new Props
        {
            Attributes = new Dictionary<string, string>
            {
                ["d"] = paths.TryGetValue(name, out var path) ? path : paths["arrow"]
            }
        }));
    }

    /// <summary>Creates the hand-drawn underline used in the hero headline.</summary>
    public static Node Scribble() =>
        H("svg", new Props
        {
            Attributes = new Dictionary<string, string>
            {
                ["viewBox"] = "0 0 300 18",
                ["preserveAspectRatio"] = "none",
                ["aria-hidden"] = "true"
            }
        }, H("path", new Props
        {
            Attributes = new Dictionary<string, string>
            {
                ["d"] = "M3 12C60 3 120 16 180 8S260 4 297 10",
                ["fill"] = "none",
                ["stroke"] = "currentColor",
                ["stroke-width"] = "6",
                ["stroke-linecap"] = "square"
            }
        }));

    /// <summary>Creates a product's poster glyph.</summary>
    public static Node ProductGlyph(Product product, string className = "glyph") =>
        ProductGlyph(product.Glyph, className);

    /// <summary>Creates a poster glyph by name.</summary>
    public static Node ProductGlyph(string glyph, string className = "glyph")
    {
        var children = glyph switch
        {
            "spray" => new Node?[]
            {
                Rect(20, 19, 24, 37, "rx", 2, "stroke-width", 4),
                PathAttr("M26 19v-6h12v6M32 13V7", "stroke-width", 4),
                PathAttr("M36 26h8M36 32h8M36 38h8", "stroke-width", 4, "stroke-linecap", "square"),
                Rect(26, 30, 12, 5, "fill", "currentColor")
            },
            "pen" => new Node?[]
            {
                PathAttr("M32 5L52 24 32 59 12 24Z", "stroke-width", 4, "fill", "none", "stroke-linejoin", "miter"),
                Circle(32, 31, 5, "fill", "currentColor"),
                PathAttr("M32 5v21", "stroke-width", 3)
            },
            "font" => new Node?[]
            {
                PathAttr("M12 56 30 12h4l18 44", "stroke-width", 4.5, "fill", "none", "stroke-linejoin", "miter"),
                PathAttr("M20 39h20", "stroke-width", 4.5),
                PathAttr("M6 56h52", "stroke-width", 2.5, "stroke-linecap", "square")
            },
            "play" => new Node?[]
            {
                Rect(5, 13, 54, 38, "rx", 2, "stroke-width", 4, "fill", "none"),
                PathAttr("M26 23l16 9-16 9V23z", "fill", "currentColor"),
                PathAttr("M12 19v4M52 19v4M12 41v4M52 41v4", "stroke-width", 4)
            },
            "wave" => new Node?[]
            {
                PathAttr("M9 34v-6M17 42V22M25 48V16M33 54V10M41 46V18M49 40V24M57 36v-8",
                    "stroke-width", 6, "stroke-linecap", "square")
            },
            "type" => new Node?[]
            {
                H("text", new Props
                {
                    Attributes = new Dictionary<string, string>
                    {
                        ["x"] = "2",
                        ["y"] = "46",
                        ["font-family"] = "Archivo, Arial Black, sans-serif",
                        ["font-weight"] = "900",
                        ["font-size"] = "38",
                        ["letter-spacing"] = "-3",
                        ["fill"] = "currentColor"
                    }
                }, Text("Aa"))
            },
            _ => new Node?[]
            {
                PathAttr("M32 5L56 19v26L32 59 8 45V19Z", "stroke-width", 4, "fill", "none", "stroke-linejoin", "miter"),
                PathAttr("M8 19l24 14 24-14M32 33v26", "stroke-width", 4, "fill", "none")
            }
        };

        return H("svg", new Props
        {
            ClassName = className,
            Attributes = new Dictionary<string, string>
            {
                ["viewBox"] = "0 0 64 64",
                ["aria-hidden"] = "true",
                ["fill"] = "none",
                ["stroke"] = "currentColor"
            }
        }, children);
    }

    private static Node Rect(double x, double y, double width, double height, params object[] attributes)
    {
        var values = AttrMap(attributes);
        values["x"] = Number(x);
        values["y"] = Number(y);
        values["width"] = Number(width);
        values["height"] = Number(height);
        values["stroke"] = "currentColor";
        return H("rect", new Props { Attributes = values });
    }

    private static Node Circle(double cx, double cy, double radius, params object[] attributes)
    {
        var values = AttrMap(attributes);
        values["cx"] = Number(cx);
        values["cy"] = Number(cy);
        values["r"] = Number(radius);
        values["stroke"] = "currentColor";
        return H("circle", new Props { Attributes = values });
    }

    private static Node PathAttr(string data, params object[] attributes)
    {
        var values = AttrMap(attributes);
        values["d"] = data;
        values["stroke"] = "currentColor";
        return H("path", new Props { Attributes = values });
    }

    private static Dictionary<string, string> AttrMap(params object[] attributes)
    {
        var values = new Dictionary<string, string>(StringComparer.Ordinal);

        for (var i = 0; i + 1 < attributes.Length; i += 2)
        {
            values[Convert.ToString(attributes[i], CultureInfo.InvariantCulture) ?? ""] =
                Convert.ToString(attributes[i + 1], CultureInfo.InvariantCulture) ?? "";
        }

        return values;
    }

    private static string Number(double value) =>
        value.ToString("0.##", CultureInfo.InvariantCulture);
}
