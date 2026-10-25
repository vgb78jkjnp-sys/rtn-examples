using System;
using System.Collections.Generic;
using System.IO;

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Provides methods to read the contents of a text file into a list of strings.
    /// </summary>
    /// <summary>
    /// Interface for reading the contents of a text file into a list of strings or a dictionary.
    /// </summary>
    public interface ITextFileReader
    {
        List<string> ReadAllLinesToList(string filePath);
        Dictionary<string, string> ReadAllLinesToDistinctList(string filePath);
    }

    /// <summary>
    /// Provides methods to read the contents of a text file into a list of strings or a dictionary.
    /// </summary>
    public class TextFileReader : ITextFileReader
    {
        /// <inheritdoc />
        public List<string> ReadAllLinesToList(string filePath)
        {
            try
            {
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {filePath}");
            return new List<string>(File.ReadAllLines(filePath));
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to read all lines from file '{filePath}'.", ex);
            }
        }

        /// <inheritdoc />
        public Dictionary<string, string> ReadAllLinesToDistinctList(string filePath)
        {
            try
            {
            var lines = ReadAllLinesToList(filePath);
            var result = new Dictionary<string, string>();
            foreach (var line in lines)
            {
                if (result.ContainsKey(line))
                    throw new ArgumentException($"Duplicate line found in file: '{line}'", nameof(filePath));
                result[line] = string.Empty;
            }
            return result;
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to read distinct lines from file '{filePath}'.", ex);
            }
        }
    }
}
