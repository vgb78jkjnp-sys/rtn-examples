using System;
using System.IO;
using System.Text;

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Interface for rotating logger functionality.
    /// </summary>
    public interface IRotatingLogger
    {
        /// <summary>
        /// Writes a log entry to the log file, rotating the file if necessary.
        /// </summary>
        /// <param name="message">The message to log.</param>
        void Log(string message);
    }
}

namespace RTN.Framework.Utilities
{
    /// <summary>
    /// Provides simple file-based logging with automatic log file rotation when a maximum file size is reached.
    /// </summary>
    public class RotatingLogger : IRotatingLogger
    {
        private readonly string _logDirectory;
        private readonly string _logFileName;
        private readonly long _maxFileSizeBytes;
        private readonly int _maxBackupFiles;
        private readonly object _lock = new object();

        /// <summary>
        /// Initializes a new instance of the <see cref="RotatingLogger"/> class.
        /// </summary>
        /// <param name="logDirectory">The directory where log files will be stored.</param>
        /// <param name="logFileName">The base name of the log file.</param>
        /// <param name="maxFileSizeBytes">The maximum size (in bytes) before the log file is rotated.</param>
        /// <param name="maxBackupFiles">The maximum number of backup log files to keep.</param>
        public RotatingLogger(string logDirectory, string logFileName = "log.txt", long maxFileSizeBytes = 1048576, int maxBackupFiles = 5)
        {
            _logDirectory = logDirectory;
            _logFileName = logFileName;
            _maxFileSizeBytes = maxFileSizeBytes;
            _maxBackupFiles = maxBackupFiles;
            Directory.CreateDirectory(_logDirectory);
        }

        /// <summary>
        /// Writes a log entry to the log file, rotating the file if necessary.
        /// </summary>
        /// <param name="message">The message to log.</param>
        public void Log(string message)
        {
            lock (_lock)
            {
                string logPath = Path.Combine(_logDirectory, _logFileName);
                try
                {
                RotateIfNeeded(logPath);
                string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}{Environment.NewLine}";
                File.AppendAllText(logPath, logEntry, Encoding.UTF8);
                }
                catch (Exception ex)
                {
                    throw new IOException($"Failed to write log entry to '{_logFileName}'.", ex);
                }
            }
        }

        /// <summary>
        /// Rotates the log file if it exceeds the maximum file size, maintaining backup files.
        /// </summary>
        /// <param name="logPath">The path to the current log file.</param>
        private void RotateIfNeeded(string logPath)
        {
            try
            {
            if (File.Exists(logPath) && new FileInfo(logPath).Length >= _maxFileSizeBytes)
            {
                for (int i = _maxBackupFiles - 1; i >= 1; i--)
                {
                    string src = Path.Combine(_logDirectory, $"{_logFileName}.{i}");
                    string dest = Path.Combine(_logDirectory, $"{_logFileName}.{i + 1}");
                    if (File.Exists(src))
                    {
                        if (File.Exists(dest))
                            File.Delete(dest);
                        File.Move(src, dest);
                    }
                }
                string firstBackup = Path.Combine(_logDirectory, $"{_logFileName}.1");
                if (File.Exists(firstBackup))
                    File.Delete(firstBackup);
                File.Move(logPath, firstBackup);
            }
            }
            catch (Exception ex)
            {
                throw new IOException($"Failed to rotate log file '{_logFileName}'.", ex);
            }
        }
    }
}
