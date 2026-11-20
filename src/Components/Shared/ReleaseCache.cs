using OpenCreativeSuite.Interop;

namespace OpenCreativeSuite.Components.Shared;

/// <summary>Caches one GitHub release lookup per repository.</summary>
internal static class ReleaseCache
{
    private static readonly Dictionary<string, Task<ReleaseInfo?>> Tasks =
        new(StringComparer.Ordinal);

    public static Task<ReleaseInfo?> GetAsync(string repo)
    {
        lock (Tasks)
        {
            if (!Tasks.TryGetValue(repo, out var task))
            {
                task = SiteInterop.FetchLatestReleaseAsync(repo);
                Tasks[repo] = task;
            }

            return task;
        }
    }
}
