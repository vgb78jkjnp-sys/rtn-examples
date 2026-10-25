using System;
using System.Collections.Generic;
using System.IO;

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Interface for writing a list of strings to a text file.
    /// </summary>
    public interface ITextFileWriter
    {
        void WriteAllLines(string filePath, List<string> lines);
    }

    /// <summary>
    /// Provides methods to write a list of strings to a text file.
    /// </summary>
    public class TextFileWriter : ITextFileWriter
    {
        public void WriteAllLines(string filePath, List<string> lines)
        {
            if (filePath == null) throw new ArgumentNullException(nameof(filePath));
            if (lines == null) throw new ArgumentNullException(nameof(lines));
            try
            {
                File.WriteAllLines(filePath, lines);
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to write to file '{filePath}'.", ex);
            }
        }
    }
}
