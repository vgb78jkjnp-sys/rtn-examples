using System;
using System.IO;

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Interface for folder utility operations.
    /// </summary>
    public interface IFolderUtilities
    {
        void CreateFolder(string path);
        void DeleteFolder(string path, bool recursive);
        void RenameFolder(string sourcePath, string newName);
    }

    /// <summary>
    /// Provides utility methods for common folder operations such as create, delete, and rename.
    /// </summary>
    public class FolderUtilities : IFolderUtilities
    {
        public void CreateFolder(string path)
        {
            try
            {
                if (Directory.Exists(path))
                    throw new IOException($"Directory already exists: {path}");
                Directory.CreateDirectory(path);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to create directory '{path}'.", ex);
            }
        }

        public void DeleteFolder(string path, bool recursive)
        {
            try
            {
                if (!Directory.Exists(path))
                    throw new DirectoryNotFoundException($"Directory not found: {path}");
                Directory.Delete(path, recursive);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to delete directory '{path}'.", ex);
            }
        }

        public void RenameFolder(string sourcePath, string newName)
        {
            try
            {
                if (!Directory.Exists(sourcePath))
                    throw new DirectoryNotFoundException($"Source directory not found: {sourcePath}");
                var parentDir = Path.GetDirectoryName(sourcePath);
                if (string.IsNullOrEmpty(parentDir))
                    throw new IOException($"Cannot determine parent directory for: {sourcePath}");
                var destPath = Path.Combine(parentDir, newName);
                if (Directory.Exists(destPath))
                    throw new IOException($"Destination directory already exists: {destPath}");
                Directory.Move(sourcePath, destPath);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to rename directory '{sourcePath}' to '{newName}'.", ex);
            }
        }
    }
}
