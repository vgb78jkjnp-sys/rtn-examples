using System;
using System.Collections.Generic;
using System.IO;

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Interface for file utility operations.
    /// </summary>
    public interface IFileUtilities
    {
        void MoveFile(string sourcePath, string destinationPath);
        IReadOnlyList<string> MoveFiles(string sourcePath, string destinationPath, string searchPattern, bool overwrite);
        void DeleteFile(string filePath);
        int CountFiles(string folderPath);
        List<string> GetFileNames(string folderPath);
    }

    /// <summary>
    /// Provides utility methods for common file operations such as move, delete, count, and listing file names in a folder.
    /// </summary>
    public class FileUtilities : IFileUtilities
    {
        public void MoveFile(string sourcePath, string destinationPath)
        {
            try
            {
                if (!File.Exists(sourcePath))
                    throw new FileNotFoundException($"Source file not found: {sourcePath}");
                File.Move(sourcePath, destinationPath);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to move file from '{sourcePath}' to '{destinationPath}'. The error was {ex.Message}", ex);
            }
        }

        public IReadOnlyList<string> MoveFiles(
        string sourcePath, string targetDir, string searchPattern = "*.*", bool overwrite = false)
        {
            try
            {
                if (!Directory.Exists(sourcePath))
                    throw new DirectoryNotFoundException($"Source directory not found: {sourcePath}");

                Directory.CreateDirectory(targetDir);

                var movedFiles = new List<string>();
                var files = Directory.GetFiles(sourcePath, searchPattern);

                foreach (var file in files)
                {
                    var fileName = Path.GetFileName(file);
                    var destPath = Path.Combine(targetDir, fileName);

                    if (File.Exists(destPath) && !overwrite)
                        continue;

                    // 03-31-26 AS: Need to delete the file first as net4.8 does not support overwrite in File.Move
                    if (System.IO.File.Exists(destPath + file))
                    {
                        System.IO.File.Delete(destPath + file);
                    }

                    //File.Move(file, destPath, overwrite);
                    File.Move(file, destPath);
                    movedFiles.Add(destPath);
                }

                return movedFiles;
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to move files from '{sourcePath}' to '{targetDir}'.", ex);
            }
        }


        public void DeleteFile(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                    throw new FileNotFoundException($"File not found: {filePath}");
                File.Delete(filePath);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to delete file '{filePath}'.", ex);
            }
        }

        public int CountFiles(string folderPath)
        {
            try
            {
                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"Directory not found: {folderPath}");
                return Directory.GetFiles(folderPath).Length;
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to count files in directory '{folderPath}'.", ex);
            }
        }

        public List<string> GetFileNames(string folderPath)
        {
            try
            {
                if (!Directory.Exists(folderPath))
                    throw new DirectoryNotFoundException($"Directory not found: {folderPath}");
                return new List<string>(Directory.GetFiles(folderPath));
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to get file names in directory '{folderPath}'.", ex);
            }
        }
    }
}
