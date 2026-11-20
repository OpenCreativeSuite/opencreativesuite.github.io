using Donkeh.UILab;
using OpenCreativeSuite.Components.Shared;
using OpenCreativeSuite.Data;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Pages;

/// <summary>The about page: story, principles, licensing, FAQ and suite index.</summary>
public sealed class AboutPage : Component
{
    private static readonly (string Question, string Answer)[] Faqs =
    [
        ("Is it really free?",
            "Yes. Every app is fully featured, with no trial timer, no watermark, no seat limit and no locked export. The source is published under Apache 2.0 with the Commons Clause, so you can inspect, modify and build it yourself."),
        ("What's the catch?",
            "There isn't one for normal use. Open Creative Suite is built in public and funded by contributors. You are not the product: there is no account, no advertising and no telemetry. If you want to support it, star a repo, report a bug or send a pull request."),
        ("Can I use it commercially?",
            "Yes: client work, studio work, internal company work, anything. There is no licence fee and no per-seat charge. The artwork you make is yours, with no attribution requirement."),
        ("Can I resell the software?",
            "No. The Commons Clause means you cannot sell the software itself, a rebranded copy, or a product or service whose value derives entirely or substantially from it. Using it to produce and sell your own creative work is explicitly fine."),
        ("Do you collect any data?",
            "No analytics, no telemetry, no account system, no phone-home. The apps work offline. Downloads come straight from GitHub Releases, which is the only third party involved."),
        ("Which platforms are supported?",
            "Windows, macOS and Linux, with native builds for each. There is no web version and no mobile app. These are desktop tools built for real work."),
        ("Can I contribute?",
            "Absolutely. The repos are public, the roadmap is public, and issues are triaged in the open. Start with a small bug, a docs fix or a reproduction case. All of it helps."),
        ("How do updates work?",
            "Every app checks for releases on GitHub when you ask it to, never silently. You can download the latest build at any time from the product page. Older versions stay available in the releases archive."),
        ("What happens if the project stops?",
            "The source stays available. You can keep using the builds you have, fork the project for your own use, or build it yourself. No licence server means no kill switch.")
    ];

    /// <inheritdoc/>
    public override Node Render()
    {
        var data = SiteContent.Data;
        var site = data.Site;
        var products = data.Products;

        Effect(() =>
        {
            var task = SiteInterop.SetPageMetaAsync(
                $"About {site.Name}",
                "Why Open Creative Suite exists, how it is licensed, and why the tools are free forever.",
                "/about");
        }, []);

        return F(
            Section(new() { ClassName = "page-hero" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.Eyebrow($"About · since {site.Founded}", null, "margin-bottom:22px"),
                    H1(new(), Text("Tools should"), H("br"), Text("not expire.")),
                    Div(new() { ClassName = "page-hero__sub" },
                        P(new() { ClassName = "lede" },
                            Text("Open Creative Suite is a set of professional desktop tools for people who make things, built in public, source-available, and free for as long as the files exist.")),
                        Div(new() { ClassName = "btn-row" },
                            A(new() { ClassName = "btn btn--lime", Href = "/#suite" },
                                Text("Explore the suite"),
                                SiteUi.Icon("arrow")),
                            A(new()
                                {
                                    ClassName = "btn btn--outline",
                                    Href = site.Github,
                                    Target = "_blank",
                                    Rel = "noopener"
                                },
                                SiteUi.Icon("github"),
                                Text("Source code")))))),

            Section(new() { ClassName = "section" },
                Div(new() { ClassName = "wrap story" },
                    Div(new() { ClassName = "reveal" },
                        SiteUi.Eyebrow("01 / Why this exists", null, "margin-bottom:18px"),
                        H2(new(), Text("The work outlasts"), H("br"), Text("the subscription."))),
                    Div(new() { ClassName = "story__body reveal" },
                        P(new(), Text($"Open Creative Suite started in {site.Founded} with a simple complaint: making a living from creative work increasingly requires renting the tools to do it. Miss a payment and the files become raw material for someone else's software.")),
                        P(new(),
                            Text($"So we built the alternative: {SiteUi.CountWord(products.Count).ToLowerInvariant()} focused applications for {SiteUi.CategoryList()}, with more on the way, sharing a design language and an obsession with "),
                            Strong(new(), Text("files that open tomorrow")),
                            Text(". No accounts, no cloud, no licence server waiting to switch off.")),
                        P(new(), Text("The suite is funded by contributors, not customers. That changes the incentives: features ship when they are ready, not when the pricing page needs a new tier. Nothing is held back to protect an upsell, because there isn't one.")),
                        P(new(),
                            Text("It is not a protest project. These are tools we use every day, built to a professional standard, with the specific goal of being "),
                            Strong(new(), Text("unremarkable to switch to")),
                            Text(". Open the app, find the tool, do the work, export."))))),

            Section(new() { ClassName = "section section--dark" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        "02 / What we believe",
                        "Four rules.<br>No exceptions.",
                        "These are not marketing values. They are constraints that decide what we build and what we refuse to build."),
                    Div(new()
                    {
                        ClassName = "principles",
                        Attributes = new Dictionary<string, string> { ["style"] = "margin-top:0" }
                    },
                        C<Principle, PrincipleProps>(new PrincipleProps
                        {
                            Index = 0,
                            Title = "Free is the feature",
                            Body = "No trials, no tiers and no upsell hiding the export button. If a feature exists, it ships in the free build."
                        }),
                        C<Principle, PrincipleProps>(new PrincipleProps
                        {
                            Index = 1,
                            Title = "Your files are yours",
                            Body = "Open formats, published specs and no cloud dependency. Work offline; leave whenever you like."
                        }),
                        C<Principle, PrincipleProps>(new PrincipleProps
                        {
                            Index = 2,
                            Title = "Source in the open",
                            Body = "Apache 2.0 with the Commons Clause, a public roadmap and public issues. You get the same code we run, including the right to fork it for yourself."
                        }),
                        C<Principle, PrincipleProps>(new PrincipleProps
                        {
                            Index = 3,
                            Title = "No account, no telemetry",
                            Body = "No login, no analytics, no usage pings. We cannot lose, sell or leak data we never collect."
                        })))),

            Section(new() { ClassName = "section", Id = "licensing" },
                Div(new() { ClassName = "wrap story" },
                    Div(new() { ClassName = "reveal" },
                        SiteUi.Eyebrow("03 / Licensing", null, "margin-bottom:18px"),
                        H2(new(), Text("Apache 2.0"), H("br"), Text("+ Commons Clause."))),
                    Div(new() { ClassName = "story__body reveal" },
                        P(new(), Strong(new(), Text("Use it for anything. ")), Text("Personal, commercial, studio, classroom, internal company work. No royalties, no per-seat fee and no attribution required in your work.")),
                        P(new(), Strong(new(), Text("Your output is yours. ")), Text("The licence covers the software, not the images, icons, logos or layouts you make with it.")),
                        P(new(), Strong(new(), Text("Modify it and share it. ")), Text("Fork the source, change it, build your own version. If you pass it on, keep the licence and notices with it.")),
                        P(new(), Strong(new(), Text("Don't sell the software. ")), Text("You may not sell the app itself, a renamed copy, or a product or service whose value derives entirely or substantially from it. Selling the work you make with it is fine.")),
                        P(new(), Strong(new(), Text("No warranty. ")), Text("These are professional tools, but they are provided as-is. Back up your work, as you would with any app.")),
                        P(new()
                        {
                            ClassName = "mono",
                            Attributes = new Dictionary<string, string>
                            {
                                ["style"] = "color:var(--muted);letter-spacing:.06em"
                            }
                        }, Text("Source-available, not OSI open source, because of the no-resale condition.")),
                        A(new()
                            {
                                ClassName = "text-link",
                                Href = site.LicenseUrl,
                                Target = "_blank",
                                Rel = "noopener"
                            },
                            Text("Read the full licence"),
                            SiteUi.Icon("arrowUpRight"))))),

            Section(new()
            {
                ClassName = "section section--paper2",
                Id = "faq"
            },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead(
                        "04 / Questions",
                        "The honest<br>answers.",
                        "If something is still unclear, the issue tracker and the GitHub community are open. No support tier, no ticket queue."),
                    Div(new() { ClassName = "faq" },
                        Each(Faqs, faq => C<FaqItem, FaqItemProps>(new FaqItemProps
                        {
                            Question = faq.Question,
                            Answer = faq.Answer
                        }))))),

            Section(new() { ClassName = "section section--tight" },
                Div(new() { ClassName = "wrap" },
                    SiteUi.SectionHead("05 / The suite", "Pick a tool.", ""),
                    Div(new() { ClassName = "next-grid" },
                        Each(products, product => C<NextCard, NextCardProps>(new NextCardProps
                        {
                            Product = product,
                            Label = product.Category,
                            ArrowInLabel = false
                        }))))),

            C<CtaBand, CtaBandProps>(new CtaBandProps
            {
                Title = "Make something<br>they can't bill you for.",
                Copy = $"{products.Count} apps, no account, no card. Download one or take the lot.",
                PrimaryLabel = "Browse the suite",
                PrimaryHref = "/#suite",
                SecondaryLabel = "Visit GitHub",
                SecondaryHref = site.Community
            }));
    }
}
