using Donkeh.UILab;
using OpenCreativeSuite.Interop;
using static Donkeh.UILab.HtmlHelper;
using static Donkeh.UILab._;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Props for the copy button.</summary>
public sealed class CopyButtonProps
{
    /// <summary>Gets the text to copy.</summary>
    public string Text { get; init; } = "";
}

/// <summary>Copies a block of code and briefly confirms the action.</summary>
public sealed class CopyButton : Component<CopyButtonProps>
{
    /// <inheritdoc/>
    public override Node Render()
    {
        var (copied, setCopied) = State(false);

        async Task CopyAsync()
        {
            var ok = await SiteInterop.CopyTextAsync(Props.Text);

            if (!ok)
            {
                return;
            }

            setCopied(true);

            try
            {
                await Task.Delay(1600);
                setCopied(false);
            }
            catch
            {
                // The page may have navigated away; nothing to reset.
            }
        }

        return Button(new()
        {
            ClassName = "copy-btn",
            Type = "button",
            OnClick = () => { var task = CopyAsync(); }
        }, Text(copied ? "Copied" : "Copy"));
    }
}
